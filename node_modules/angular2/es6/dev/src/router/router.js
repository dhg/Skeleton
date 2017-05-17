var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { PromiseWrapper, EventEmitter, ObservableWrapper } from 'angular2/src/facade/async';
import { Map, StringMapWrapper } from 'angular2/src/facade/collection';
import { isBlank, isPresent, Type } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { Inject, Injectable } from 'angular2/core';
import { RouteRegistry, ROUTER_PRIMARY_COMPONENT } from './route_registry';
import { Location } from './location/location';
import { getCanActivateHook } from './lifecycle/route_lifecycle_reflector';
let _resolveToTrue = PromiseWrapper.resolve(true);
let _resolveToFalse = PromiseWrapper.resolve(false);
/**
 * The `Router` is responsible for mapping URLs to components.
 *
 * You can see the state of the router by inspecting the read-only field `router.navigating`.
 * This may be useful for showing a spinner, for instance.
 *
 * ## Concepts
 *
 * Routers and component instances have a 1:1 correspondence.
 *
 * The router holds reference to a number of {@link RouterOutlet}.
 * An outlet is a placeholder that the router dynamically fills in depending on the current URL.
 *
 * When the router navigates from a URL, it must first recognize it and serialize it into an
 * `Instruction`.
 * The router uses the `RouteRegistry` to get an `Instruction`.
 */
export let Router = class {
    constructor(registry, parent, hostComponent, root) {
        this.registry = registry;
        this.parent = parent;
        this.hostComponent = hostComponent;
        this.root = root;
        this.navigating = false;
        /**
         * The current `Instruction` for the router
         */
        this.currentInstruction = null;
        this._currentNavigation = _resolveToTrue;
        this._outlet = null;
        this._auxRouters = new Map();
        this._subject = new EventEmitter();
    }
    /**
     * Constructs a child router. You probably don't need to use this unless you're writing a reusable
     * component.
     */
    childRouter(hostComponent) {
        return this._childRouter = new ChildRouter(this, hostComponent);
    }
    /**
     * Constructs a child router. You probably don't need to use this unless you're writing a reusable
     * component.
     */
    auxRouter(hostComponent) { return new ChildRouter(this, hostComponent); }
    /**
     * Register an outlet to be notified of primary route changes.
     *
     * You probably don't need to use this unless you're writing a reusable component.
     */
    registerPrimaryOutlet(outlet) {
        if (isPresent(outlet.name)) {
            throw new BaseException(`registerPrimaryOutlet expects to be called with an unnamed outlet.`);
        }
        if (isPresent(this._outlet)) {
            throw new BaseException(`Primary outlet is already registered.`);
        }
        this._outlet = outlet;
        if (isPresent(this.currentInstruction)) {
            return this.commit(this.currentInstruction, false);
        }
        return _resolveToTrue;
    }
    /**
     * Unregister an outlet (because it was destroyed, etc).
     *
     * You probably don't need to use this unless you're writing a custom outlet implementation.
     */
    unregisterPrimaryOutlet(outlet) {
        if (isPresent(outlet.name)) {
            throw new BaseException(`registerPrimaryOutlet expects to be called with an unnamed outlet.`);
        }
        this._outlet = null;
    }
    /**
     * Register an outlet to notified of auxiliary route changes.
     *
     * You probably don't need to use this unless you're writing a reusable component.
     */
    registerAuxOutlet(outlet) {
        var outletName = outlet.name;
        if (isBlank(outletName)) {
            throw new BaseException(`registerAuxOutlet expects to be called with an outlet with a name.`);
        }
        var router = this.auxRouter(this.hostComponent);
        this._auxRouters.set(outletName, router);
        router._outlet = outlet;
        var auxInstruction;
        if (isPresent(this.currentInstruction) &&
            isPresent(auxInstruction = this.currentInstruction.auxInstruction[outletName])) {
            return router.commit(auxInstruction);
        }
        return _resolveToTrue;
    }
    /**
     * Given an instruction, returns `true` if the instruction is currently active,
     * otherwise `false`.
     */
    isRouteActive(instruction) {
        var router = this;
        while (isPresent(router.parent) && isPresent(instruction.child)) {
            router = router.parent;
            instruction = instruction.child;
        }
        return isPresent(this.currentInstruction) &&
            this.currentInstruction.component == instruction.component;
    }
    /**
     * Dynamically update the routing configuration and trigger a navigation.
     *
     * ### Usage
     *
     * ```
     * router.config([
     *   { 'path': '/', 'component': IndexComp },
     *   { 'path': '/user/:id', 'component': UserComp },
     * ]);
     * ```
     */
    config(definitions) {
        definitions.forEach((routeDefinition) => { this.registry.config(this.hostComponent, routeDefinition); });
        return this.renavigate();
    }
    /**
     * Navigate based on the provided Route Link DSL. It's preferred to navigate with this method
     * over `navigateByUrl`.
     *
     * ### Usage
     *
     * This method takes an array representing the Route Link DSL:
     * ```
     * ['./MyCmp', {param: 3}]
     * ```
     * See the {@link RouterLink} directive for more.
     */
    navigate(linkParams) {
        var instruction = this.generate(linkParams);
        return this.navigateByInstruction(instruction, false);
    }
    /**
     * Navigate to a URL. Returns a promise that resolves when navigation is complete.
     * It's preferred to navigate with `navigate` instead of this method, since URLs are more brittle.
     *
     * If the given URL begins with a `/`, router will navigate absolutely.
     * If the given URL does not begin with `/`, the router will navigate relative to this component.
     */
    navigateByUrl(url, _skipLocationChange = false) {
        return this._currentNavigation = this._currentNavigation.then((_) => {
            this.lastNavigationAttempt = url;
            this._startNavigating();
            return this._afterPromiseFinishNavigating(this.recognize(url).then((instruction) => {
                if (isBlank(instruction)) {
                    return false;
                }
                return this._navigate(instruction, _skipLocationChange);
            }));
        });
    }
    /**
     * Navigate via the provided instruction. Returns a promise that resolves when navigation is
     * complete.
     */
    navigateByInstruction(instruction, _skipLocationChange = false) {
        if (isBlank(instruction)) {
            return _resolveToFalse;
        }
        return this._currentNavigation = this._currentNavigation.then((_) => {
            this._startNavigating();
            return this._afterPromiseFinishNavigating(this._navigate(instruction, _skipLocationChange));
        });
    }
    /** @internal */
    _settleInstruction(instruction) {
        return instruction.resolveComponent().then((_) => {
            var unsettledInstructions = [];
            if (isPresent(instruction.component)) {
                instruction.component.reuse = false;
            }
            if (isPresent(instruction.child)) {
                unsettledInstructions.push(this._settleInstruction(instruction.child));
            }
            StringMapWrapper.forEach(instruction.auxInstruction, (instruction, _) => {
                unsettledInstructions.push(this._settleInstruction(instruction));
            });
            return PromiseWrapper.all(unsettledInstructions);
        });
    }
    /** @internal */
    _navigate(instruction, _skipLocationChange) {
        return this._settleInstruction(instruction)
            .then((_) => this._routerCanReuse(instruction))
            .then((_) => this._canActivate(instruction))
            .then((result) => {
            if (!result) {
                return false;
            }
            return this._routerCanDeactivate(instruction)
                .then((result) => {
                if (result) {
                    return this.commit(instruction, _skipLocationChange)
                        .then((_) => {
                        this._emitNavigationFinish(instruction.toRootUrl());
                        return true;
                    });
                }
            });
        });
    }
    _emitNavigationFinish(url) { ObservableWrapper.callEmit(this._subject, url); }
    _emitNavigationFail(url) { ObservableWrapper.callError(this._subject, url); }
    _afterPromiseFinishNavigating(promise) {
        return PromiseWrapper.catchError(promise.then((_) => this._finishNavigating()), (err) => {
            this._finishNavigating();
            throw err;
        });
    }
    /*
     * Recursively set reuse flags
     */
    /** @internal */
    _routerCanReuse(instruction) {
        if (isBlank(this._outlet)) {
            return _resolveToFalse;
        }
        if (isBlank(instruction.component)) {
            return _resolveToTrue;
        }
        return this._outlet.routerCanReuse(instruction.component)
            .then((result) => {
            instruction.component.reuse = result;
            if (result && isPresent(this._childRouter) && isPresent(instruction.child)) {
                return this._childRouter._routerCanReuse(instruction.child);
            }
        });
    }
    _canActivate(nextInstruction) {
        return canActivateOne(nextInstruction, this.currentInstruction);
    }
    _routerCanDeactivate(instruction) {
        if (isBlank(this._outlet)) {
            return _resolveToTrue;
        }
        var next;
        var childInstruction = null;
        var reuse = false;
        var componentInstruction = null;
        if (isPresent(instruction)) {
            childInstruction = instruction.child;
            componentInstruction = instruction.component;
            reuse = isBlank(instruction.component) || instruction.component.reuse;
        }
        if (reuse) {
            next = _resolveToTrue;
        }
        else {
            next = this._outlet.routerCanDeactivate(componentInstruction);
        }
        // TODO: aux route lifecycle hooks
        return next.then((result) => {
            if (result == false) {
                return false;
            }
            if (isPresent(this._childRouter)) {
                return this._childRouter._routerCanDeactivate(childInstruction);
            }
            return true;
        });
    }
    /**
     * Updates this router and all descendant routers according to the given instruction
     */
    commit(instruction, _skipLocationChange = false) {
        this.currentInstruction = instruction;
        var next = _resolveToTrue;
        if (isPresent(this._outlet) && isPresent(instruction.component)) {
            var componentInstruction = instruction.component;
            if (componentInstruction.reuse) {
                next = this._outlet.reuse(componentInstruction);
            }
            else {
                next =
                    this.deactivate(instruction).then((_) => this._outlet.activate(componentInstruction));
            }
            if (isPresent(instruction.child)) {
                next = next.then((_) => {
                    if (isPresent(this._childRouter)) {
                        return this._childRouter.commit(instruction.child);
                    }
                });
            }
        }
        var promises = [];
        this._auxRouters.forEach((router, name) => {
            if (isPresent(instruction.auxInstruction[name])) {
                promises.push(router.commit(instruction.auxInstruction[name]));
            }
        });
        return next.then((_) => PromiseWrapper.all(promises));
    }
    /** @internal */
    _startNavigating() { this.navigating = true; }
    /** @internal */
    _finishNavigating() { this.navigating = false; }
    /**
     * Subscribe to URL updates from the router
     */
    subscribe(onNext, onError) {
        return ObservableWrapper.subscribe(this._subject, onNext, onError);
    }
    /**
     * Removes the contents of this router's outlet and all descendant outlets
     */
    deactivate(instruction) {
        var childInstruction = null;
        var componentInstruction = null;
        if (isPresent(instruction)) {
            childInstruction = instruction.child;
            componentInstruction = instruction.component;
        }
        var next = _resolveToTrue;
        if (isPresent(this._childRouter)) {
            next = this._childRouter.deactivate(childInstruction);
        }
        if (isPresent(this._outlet)) {
            next = next.then((_) => this._outlet.deactivate(componentInstruction));
        }
        // TODO: handle aux routes
        return next;
    }
    /**
     * Given a URL, returns an instruction representing the component graph
     */
    recognize(url) {
        var ancestorComponents = this._getAncestorInstructions();
        return this.registry.recognize(url, ancestorComponents);
    }
    _getAncestorInstructions() {
        var ancestorInstructions = [this.currentInstruction];
        var ancestorRouter = this;
        while (isPresent(ancestorRouter = ancestorRouter.parent)) {
            ancestorInstructions.unshift(ancestorRouter.currentInstruction);
        }
        return ancestorInstructions;
    }
    /**
     * Navigates to either the last URL successfully navigated to, or the last URL requested if the
     * router has yet to successfully navigate.
     */
    renavigate() {
        if (isBlank(this.lastNavigationAttempt)) {
            return this._currentNavigation;
        }
        return this.navigateByUrl(this.lastNavigationAttempt);
    }
    /**
     * Generate an `Instruction` based on the provided Route Link DSL.
     */
    generate(linkParams) {
        var ancestorInstructions = this._getAncestorInstructions();
        return this.registry.generate(linkParams, ancestorInstructions);
    }
};
Router = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [RouteRegistry, Router, Object, Router])
], Router);
export let RootRouter = class extends Router {
    constructor(registry, location, primaryComponent) {
        super(registry, null, primaryComponent);
        this.root = this;
        this._location = location;
        this._locationSub = this._location.subscribe((change) => {
            // we call recognize ourselves
            this.recognize(change['url'])
                .then((instruction) => {
                if (isPresent(instruction)) {
                    this.navigateByInstruction(instruction, isPresent(change['pop']))
                        .then((_) => {
                        // this is a popstate event; no need to change the URL
                        if (isPresent(change['pop']) && change['type'] != 'hashchange') {
                            return;
                        }
                        var emitPath = instruction.toUrlPath();
                        var emitQuery = instruction.toUrlQuery();
                        if (emitPath.length > 0 && emitPath[0] != '/') {
                            emitPath = '/' + emitPath;
                        }
                        // Because we've opted to use All hashchange events occur outside Angular.
                        // However, apps that are migrating might have hash links that operate outside
                        // angular to which routing must respond.
                        // To support these cases where we respond to hashchanges and redirect as a
                        // result, we need to replace the top item on the stack.
                        if (change['type'] == 'hashchange') {
                            if (instruction.toRootUrl() != this._location.path()) {
                                this._location.replaceState(emitPath, emitQuery);
                            }
                        }
                        else {
                            this._location.go(emitPath, emitQuery);
                        }
                    });
                }
                else {
                    this._emitNavigationFail(change['url']);
                }
            });
        });
        this.registry.configFromComponent(primaryComponent);
        this.navigateByUrl(location.path());
    }
    commit(instruction, _skipLocationChange = false) {
        var emitPath = instruction.toUrlPath();
        var emitQuery = instruction.toUrlQuery();
        if (emitPath.length > 0 && emitPath[0] != '/') {
            emitPath = '/' + emitPath;
        }
        var promise = super.commit(instruction);
        if (!_skipLocationChange) {
            promise = promise.then((_) => { this._location.go(emitPath, emitQuery); });
        }
        return promise;
    }
    dispose() {
        if (isPresent(this._locationSub)) {
            ObservableWrapper.dispose(this._locationSub);
            this._locationSub = null;
        }
    }
};
RootRouter = __decorate([
    Injectable(),
    __param(2, Inject(ROUTER_PRIMARY_COMPONENT)), 
    __metadata('design:paramtypes', [RouteRegistry, Location, Type])
], RootRouter);
class ChildRouter extends Router {
    constructor(parent, hostComponent) {
        super(parent.registry, parent, hostComponent, parent.root);
        this.parent = parent;
    }
    navigateByUrl(url, _skipLocationChange = false) {
        // Delegate navigation to the root router
        return this.parent.navigateByUrl(url, _skipLocationChange);
    }
    navigateByInstruction(instruction, _skipLocationChange = false) {
        // Delegate navigation to the root router
        return this.parent.navigateByInstruction(instruction, _skipLocationChange);
    }
}
function canActivateOne(nextInstruction, prevInstruction) {
    var next = _resolveToTrue;
    if (isBlank(nextInstruction.component)) {
        return next;
    }
    if (isPresent(nextInstruction.child)) {
        next = canActivateOne(nextInstruction.child, isPresent(prevInstruction) ? prevInstruction.child : null);
    }
    return next.then((result) => {
        if (result == false) {
            return false;
        }
        if (nextInstruction.component.reuse) {
            return true;
        }
        var hook = getCanActivateHook(nextInstruction.component.componentType);
        if (isPresent(hook)) {
            return hook(nextInstruction.component, isPresent(prevInstruction) ? prevInstruction.component : null);
        }
        return true;
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL3JvdXRlci9yb3V0ZXIudHMiXSwibmFtZXMiOlsiUm91dGVyIiwiUm91dGVyLmNvbnN0cnVjdG9yIiwiUm91dGVyLmNoaWxkUm91dGVyIiwiUm91dGVyLmF1eFJvdXRlciIsIlJvdXRlci5yZWdpc3RlclByaW1hcnlPdXRsZXQiLCJSb3V0ZXIudW5yZWdpc3RlclByaW1hcnlPdXRsZXQiLCJSb3V0ZXIucmVnaXN0ZXJBdXhPdXRsZXQiLCJSb3V0ZXIuaXNSb3V0ZUFjdGl2ZSIsIlJvdXRlci5jb25maWciLCJSb3V0ZXIubmF2aWdhdGUiLCJSb3V0ZXIubmF2aWdhdGVCeVVybCIsIlJvdXRlci5uYXZpZ2F0ZUJ5SW5zdHJ1Y3Rpb24iLCJSb3V0ZXIuX3NldHRsZUluc3RydWN0aW9uIiwiUm91dGVyLl9uYXZpZ2F0ZSIsIlJvdXRlci5fZW1pdE5hdmlnYXRpb25GaW5pc2giLCJSb3V0ZXIuX2VtaXROYXZpZ2F0aW9uRmFpbCIsIlJvdXRlci5fYWZ0ZXJQcm9taXNlRmluaXNoTmF2aWdhdGluZyIsIlJvdXRlci5fcm91dGVyQ2FuUmV1c2UiLCJSb3V0ZXIuX2NhbkFjdGl2YXRlIiwiUm91dGVyLl9yb3V0ZXJDYW5EZWFjdGl2YXRlIiwiUm91dGVyLmNvbW1pdCIsIlJvdXRlci5fc3RhcnROYXZpZ2F0aW5nIiwiUm91dGVyLl9maW5pc2hOYXZpZ2F0aW5nIiwiUm91dGVyLnN1YnNjcmliZSIsIlJvdXRlci5kZWFjdGl2YXRlIiwiUm91dGVyLnJlY29nbml6ZSIsIlJvdXRlci5fZ2V0QW5jZXN0b3JJbnN0cnVjdGlvbnMiLCJSb3V0ZXIucmVuYXZpZ2F0ZSIsIlJvdXRlci5nZW5lcmF0ZSIsIlJvb3RSb3V0ZXIiLCJSb290Um91dGVyLmNvbnN0cnVjdG9yIiwiUm9vdFJvdXRlci5jb21taXQiLCJSb290Um91dGVyLmRpc3Bvc2UiLCJDaGlsZFJvdXRlciIsIkNoaWxkUm91dGVyLmNvbnN0cnVjdG9yIiwiQ2hpbGRSb3V0ZXIubmF2aWdhdGVCeVVybCIsIkNoaWxkUm91dGVyLm5hdmlnYXRlQnlJbnN0cnVjdGlvbiIsImNhbkFjdGl2YXRlT25lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7T0FBTyxFQUFDLGNBQWMsRUFBRSxZQUFZLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSwyQkFBMkI7T0FDbEYsRUFBQyxHQUFHLEVBQUUsZ0JBQWdCLEVBQTBCLE1BQU0sZ0NBQWdDO09BQ3RGLEVBQUMsT0FBTyxFQUFZLFNBQVMsRUFBRSxJQUFJLEVBQVUsTUFBTSwwQkFBMEI7T0FDN0UsRUFBQyxhQUFhLEVBQW1CLE1BQU0sZ0NBQWdDO09BQ3ZFLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBQyxNQUFNLGVBQWU7T0FFekMsRUFBQyxhQUFhLEVBQUUsd0JBQXdCLEVBQUMsTUFBTSxrQkFBa0I7T0FNakUsRUFBQyxRQUFRLEVBQUMsTUFBTSxxQkFBcUI7T0FDckMsRUFBQyxrQkFBa0IsRUFBQyxNQUFNLHVDQUF1QztBQUd4RSxJQUFJLGNBQWMsR0FBRyxjQUFjLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2xELElBQUksZUFBZSxHQUFHLGNBQWMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7QUFFcEQ7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnQkc7QUFDSDtJQWtCRUEsWUFBbUJBLFFBQXVCQSxFQUFTQSxNQUFjQSxFQUFTQSxhQUFrQkEsRUFDekVBLElBQWFBO1FBRGJDLGFBQVFBLEdBQVJBLFFBQVFBLENBQWVBO1FBQVNBLFdBQU1BLEdBQU5BLE1BQU1BLENBQVFBO1FBQVNBLGtCQUFhQSxHQUFiQSxhQUFhQSxDQUFLQTtRQUN6RUEsU0FBSUEsR0FBSkEsSUFBSUEsQ0FBU0E7UUFqQmhDQSxlQUFVQSxHQUFZQSxLQUFLQSxDQUFDQTtRQUU1QkE7O1dBRUdBO1FBQ0lBLHVCQUFrQkEsR0FBZ0JBLElBQUlBLENBQUNBO1FBRXRDQSx1QkFBa0JBLEdBQWlCQSxjQUFjQSxDQUFDQTtR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QSxlQUFlQSxDQUFDQSxLQUFLQSxFQUNyQkEsU0FBU0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsR0FBR0EsZUFBZUEsQ0FBQ0EsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFDbkZBLENBQUNBO0lBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQVVBLENBQUNBLE1BQWVBO1FBQ3hDQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxJQUFJQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNwQkEsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFDZkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDcENBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2RBLENBQUNBO1FBQ0RBLElBQUlBLElBQUlBLEdBQUdBLGtCQUFrQkEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0E7UUFDdkVBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3BCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxlQUFlQSxDQUFDQSxTQUFTQSxFQUN6QkEsU0FBU0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsR0FBR0EsZUFBZUEsQ0FBQ0EsU0FBU0EsR0FBR0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDN0VBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO0lBQ2RBLENBQUNBLENBQUNBLENBQUNBO0FBQ0xBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtQcm9taXNlV3JhcHBlciwgRXZlbnRFbWl0dGVyLCBPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge01hcCwgU3RyaW5nTWFwV3JhcHBlciwgTWFwV3JhcHBlciwgTGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge2lzQmxhbmssIGlzU3RyaW5nLCBpc1ByZXNlbnQsIFR5cGUsIGlzQXJyYXl9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIFdyYXBwZWRFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5cbmltcG9ydCB7Um91dGVSZWdpc3RyeSwgUk9VVEVSX1BSSU1BUllfQ09NUE9ORU5UfSBmcm9tICcuL3JvdXRlX3JlZ2lzdHJ5JztcbmltcG9ydCB7XG4gIENvbXBvbmVudEluc3RydWN0aW9uLFxuICBJbnN0cnVjdGlvbixcbn0gZnJvbSAnLi9pbnN0cnVjdGlvbic7XG5pbXBvcnQge1JvdXRlck91dGxldH0gZnJvbSAnLi9kaXJlY3RpdmVzL3JvdXRlcl9vdXRsZXQnO1xuaW1wb3J0IHtMb2NhdGlvbn0gZnJvbSAnLi9sb2NhdGlvbi9sb2NhdGlvbic7XG5pbXBvcnQge2dldENhbkFjdGl2YXRlSG9va30gZnJvbSAnLi9saWZlY3ljbGUvcm91dGVfbGlmZWN5Y2xlX3JlZmxlY3Rvcic7XG5pbXBvcnQge1JvdXRlRGVmaW5pdGlvbn0gZnJvbSAnLi9yb3V0ZV9jb25maWcvcm91dGVfY29uZmlnX2ltcGwnO1xuXG5sZXQgX3Jlc29sdmVUb1RydWUgPSBQcm9taXNlV3JhcHBlci5yZXNvbHZlKHRydWUpO1xubGV0IF9yZXNvbHZlVG9GYWxzZSA9IFByb21pc2VXcmFwcGVyLnJlc29sdmUoZmFsc2UpO1xuXG4vKipcbiAqIFRoZSBgUm91dGVyYCBpcyByZXNwb25zaWJsZSBmb3IgbWFwcGluZyBVUkxzIHRvIGNvbXBvbmVudHMuXG4gKlxuICogWW91IGNhbiBzZWUgdGhlIHN0YXRlIG9mIHRoZSByb3V0ZXIgYnkgaW5zcGVjdGluZyB0aGUgcmVhZC1vbmx5IGZpZWxkIGByb3V0ZXIubmF2aWdhdGluZ2AuXG4gKiBUaGlzIG1heSBiZSB1c2VmdWwgZm9yIHNob3dpbmcgYSBzcGlubmVyLCBmb3IgaW5zdGFuY2UuXG4gKlxuICogIyMgQ29uY2VwdHNcbiAqXG4gKiBSb3V0ZXJzIGFuZCBjb21wb25lbnQgaW5zdGFuY2VzIGhhdmUgYSAxOjEgY29ycmVzcG9uZGVuY2UuXG4gKlxuICogVGhlIHJvdXRlciBob2xkcyByZWZlcmVuY2UgdG8gYSBudW1iZXIgb2Yge0BsaW5rIFJvdXRlck91dGxldH0uXG4gKiBBbiBvdXRsZXQgaXMgYSBwbGFjZWhvbGRlciB0aGF0IHRoZSByb3V0ZXIgZHluYW1pY2FsbHkgZmlsbHMgaW4gZGVwZW5kaW5nIG9uIHRoZSBjdXJyZW50IFVSTC5cbiAqXG4gKiBXaGVuIHRoZSByb3V0ZXIgbmF2aWdhdGVzIGZyb20gYSBVUkwsIGl0IG11c3QgZmlyc3QgcmVjb2duaXplIGl0IGFuZCBzZXJpYWxpemUgaXQgaW50byBhblxuICogYEluc3RydWN0aW9uYC5cbiAqIFRoZSByb3V0ZXIgdXNlcyB0aGUgYFJvdXRlUmVnaXN0cnlgIHRvIGdldCBhbiBgSW5zdHJ1Y3Rpb25gLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUm91dGVyIHtcbiAgbmF2aWdhdGluZzogYm9vbGVhbiA9IGZhbHNlO1xuICBsYXN0TmF2aWdhdGlvbkF0dGVtcHQ6IHN0cmluZztcbiAgLyoqXG4gICAqIFRoZSBjdXJyZW50IGBJbnN0cnVjdGlvbmAgZm9yIHRoZSByb3V0ZXJcbiAgICovXG4gIHB1YmxpYyBjdXJyZW50SW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uID0gbnVsbDtcblxuICBwcml2YXRlIF9jdXJyZW50TmF2aWdhdGlvbjogUHJvbWlzZTxhbnk+ID0gX3Jlc29sdmVUb1RydWU7XG4gIHByaXZhdGUgX291dGxldDogUm91dGVyT3V0bGV0ID0gbnVsbDtcblxuICBwcml2YXRlIF9hdXhSb3V0ZXJzID0gbmV3IE1hcDxzdHJpbmcsIFJvdXRlcj4oKTtcbiAgcHJpdmF0ZSBfY2hpbGRSb3V0ZXI6IFJvdXRlcjtcblxuICBwcml2YXRlIF9zdWJqZWN0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyByZWdpc3RyeTogUm91dGVSZWdpc3RyeSwgcHVibGljIHBhcmVudDogUm91dGVyLCBwdWJsaWMgaG9zdENvbXBvbmVudDogYW55LFxuICAgICAgICAgICAgICBwdWJsaWMgcm9vdD86IFJvdXRlcikge31cblxuICAvKipcbiAgICogQ29uc3RydWN0cyBhIGNoaWxkIHJvdXRlci4gWW91IHByb2JhYmx5IGRvbid0IG5lZWQgdG8gdXNlIHRoaXMgdW5sZXNzIHlvdSdyZSB3cml0aW5nIGEgcmV1c2FibGVcbiAgICogY29tcG9uZW50LlxuICAgKi9cbiAgY2hpbGRSb3V0ZXIoaG9zdENvbXBvbmVudDogYW55KTogUm91dGVyIHtcbiAgICByZXR1cm4gdGhpcy5fY2hpbGRSb3V0ZXIgPSBuZXcgQ2hpbGRSb3V0ZXIodGhpcywgaG9zdENvbXBvbmVudCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3RzIGEgY2hpbGQgcm91dGVyLiBZb3UgcHJvYmFibHkgZG9uJ3QgbmVlZCB0byB1c2UgdGhpcyB1bmxlc3MgeW91J3JlIHdyaXRpbmcgYSByZXVzYWJsZVxuICAgKiBjb21wb25lbnQuXG4gICAqL1xuICBhdXhSb3V0ZXIoaG9zdENvbXBvbmVudDogYW55KTogUm91dGVyIHsgcmV0dXJuIG5ldyBDaGlsZFJvdXRlcih0aGlzLCBob3N0Q29tcG9uZW50KTsgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhbiBvdXRsZXQgdG8gYmUgbm90aWZpZWQgb2YgcHJpbWFyeSByb3V0ZSBjaGFuZ2VzLlxuICAgKlxuICAgKiBZb3UgcHJvYmFibHkgZG9uJ3QgbmVlZCB0byB1c2UgdGhpcyB1bmxlc3MgeW91J3JlIHdyaXRpbmcgYSByZXVzYWJsZSBjb21wb25lbnQuXG4gICAqL1xuICByZWdpc3RlclByaW1hcnlPdXRsZXQob3V0bGV0OiBSb3V0ZXJPdXRsZXQpOiBQcm9taXNlPGFueT4ge1xuICAgIGlmIChpc1ByZXNlbnQob3V0bGV0Lm5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgcmVnaXN0ZXJQcmltYXJ5T3V0bGV0IGV4cGVjdHMgdG8gYmUgY2FsbGVkIHdpdGggYW4gdW5uYW1lZCBvdXRsZXQuYCk7XG4gICAgfVxuXG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9vdXRsZXQpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgUHJpbWFyeSBvdXRsZXQgaXMgYWxyZWFkeSByZWdpc3RlcmVkLmApO1xuICAgIH1cblxuICAgIHRoaXMuX291dGxldCA9IG91dGxldDtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuY3VycmVudEluc3RydWN0aW9uKSkge1xuICAgICAgcmV0dXJuIHRoaXMuY29tbWl0KHRoaXMuY3VycmVudEluc3RydWN0aW9uLCBmYWxzZSk7XG4gICAgfVxuICAgIHJldHVybiBfcmVzb2x2ZVRvVHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVbnJlZ2lzdGVyIGFuIG91dGxldCAoYmVjYXVzZSBpdCB3YXMgZGVzdHJveWVkLCBldGMpLlxuICAgKlxuICAgKiBZb3UgcHJvYmFibHkgZG9uJ3QgbmVlZCB0byB1c2UgdGhpcyB1bmxlc3MgeW91J3JlIHdyaXRpbmcgYSBjdXN0b20gb3V0bGV0IGltcGxlbWVudGF0aW9uLlxuICAgKi9cbiAgdW5yZWdpc3RlclByaW1hcnlPdXRsZXQob3V0bGV0OiBSb3V0ZXJPdXRsZXQpOiB2b2lkIHtcbiAgICBpZiAoaXNQcmVzZW50KG91dGxldC5uYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYHJlZ2lzdGVyUHJpbWFyeU91dGxldCBleHBlY3RzIHRvIGJlIGNhbGxlZCB3aXRoIGFuIHVubmFtZWQgb3V0bGV0LmApO1xuICAgIH1cbiAgICB0aGlzLl9vdXRsZXQgPSBudWxsO1xuICB9XG5cblxuICAvKipcbiAgICogUmVnaXN0ZXIgYW4gb3V0bGV0IHRvIG5vdGlmaWVkIG9mIGF1eGlsaWFyeSByb3V0ZSBjaGFuZ2VzLlxuICAgKlxuICAgKiBZb3UgcHJvYmFibHkgZG9uJ3QgbmVlZCB0byB1c2UgdGhpcyB1bmxlc3MgeW91J3JlIHdyaXRpbmcgYSByZXVzYWJsZSBjb21wb25lbnQuXG4gICAqL1xuICByZWdpc3RlckF1eE91dGxldChvdXRsZXQ6IFJvdXRlck91dGxldCk6IFByb21pc2U8YW55PiB7XG4gICAgdmFyIG91dGxldE5hbWUgPSBvdXRsZXQubmFtZTtcbiAgICBpZiAoaXNCbGFuayhvdXRsZXROYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYHJlZ2lzdGVyQXV4T3V0bGV0IGV4cGVjdHMgdG8gYmUgY2FsbGVkIHdpdGggYW4gb3V0bGV0IHdpdGggYSBuYW1lLmApO1xuICAgIH1cblxuICAgIHZhciByb3V0ZXIgPSB0aGlzLmF1eFJvdXRlcih0aGlzLmhvc3RDb21wb25lbnQpO1xuXG4gICAgdGhpcy5fYXV4Um91dGVycy5zZXQob3V0bGV0TmFtZSwgcm91dGVyKTtcbiAgICByb3V0ZXIuX291dGxldCA9IG91dGxldDtcblxuICAgIHZhciBhdXhJbnN0cnVjdGlvbjtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuY3VycmVudEluc3RydWN0aW9uKSAmJlxuICAgICAgICBpc1ByZXNlbnQoYXV4SW5zdHJ1Y3Rpb24gPSB0aGlzLmN1cnJlbnRJbnN0cnVjdGlvbi5hdXhJbnN0cnVjdGlvbltvdXRsZXROYW1lXSkpIHtcbiAgICAgIHJldHVybiByb3V0ZXIuY29tbWl0KGF1eEluc3RydWN0aW9uKTtcbiAgICB9XG4gICAgcmV0dXJuIF9yZXNvbHZlVG9UcnVlO1xuICB9XG5cblxuICAvKipcbiAgICogR2l2ZW4gYW4gaW5zdHJ1Y3Rpb24sIHJldHVybnMgYHRydWVgIGlmIHRoZSBpbnN0cnVjdGlvbiBpcyBjdXJyZW50bHkgYWN0aXZlLFxuICAgKiBvdGhlcndpc2UgYGZhbHNlYC5cbiAgICovXG4gIGlzUm91dGVBY3RpdmUoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uKTogYm9vbGVhbiB7XG4gICAgdmFyIHJvdXRlcjogUm91dGVyID0gdGhpcztcbiAgICB3aGlsZSAoaXNQcmVzZW50KHJvdXRlci5wYXJlbnQpICYmIGlzUHJlc2VudChpbnN0cnVjdGlvbi5jaGlsZCkpIHtcbiAgICAgIHJvdXRlciA9IHJvdXRlci5wYXJlbnQ7XG4gICAgICBpbnN0cnVjdGlvbiA9IGluc3RydWN0aW9uLmNoaWxkO1xuICAgIH1cbiAgICByZXR1cm4gaXNQcmVzZW50KHRoaXMuY3VycmVudEluc3RydWN0aW9uKSAmJlxuICAgICAgICAgICB0aGlzLmN1cnJlbnRJbnN0cnVjdGlvbi5jb21wb25lbnQgPT0gaW5zdHJ1Y3Rpb24uY29tcG9uZW50O1xuICB9XG5cblxuICAvKipcbiAgICogRHluYW1pY2FsbHkgdXBkYXRlIHRoZSByb3V0aW5nIGNvbmZpZ3VyYXRpb24gYW5kIHRyaWdnZXIgYSBuYXZpZ2F0aW9uLlxuICAgKlxuICAgKiAjIyMgVXNhZ2VcbiAgICpcbiAgICogYGBgXG4gICAqIHJvdXRlci5jb25maWcoW1xuICAgKiAgIHsgJ3BhdGgnOiAnLycsICdjb21wb25lbnQnOiBJbmRleENvbXAgfSxcbiAgICogICB7ICdwYXRoJzogJy91c2VyLzppZCcsICdjb21wb25lbnQnOiBVc2VyQ29tcCB9LFxuICAgKiBdKTtcbiAgICogYGBgXG4gICAqL1xuICBjb25maWcoZGVmaW5pdGlvbnM6IFJvdXRlRGVmaW5pdGlvbltdKTogUHJvbWlzZTxhbnk+IHtcbiAgICBkZWZpbml0aW9ucy5mb3JFYWNoKFxuICAgICAgICAocm91dGVEZWZpbml0aW9uKSA9PiB7IHRoaXMucmVnaXN0cnkuY29uZmlnKHRoaXMuaG9zdENvbXBvbmVudCwgcm91dGVEZWZpbml0aW9uKTsgfSk7XG4gICAgcmV0dXJuIHRoaXMucmVuYXZpZ2F0ZSgpO1xuICB9XG5cblxuICAvKipcbiAgICogTmF2aWdhdGUgYmFzZWQgb24gdGhlIHByb3ZpZGVkIFJvdXRlIExpbmsgRFNMLiBJdCdzIHByZWZlcnJlZCB0byBuYXZpZ2F0ZSB3aXRoIHRoaXMgbWV0aG9kXG4gICAqIG92ZXIgYG5hdmlnYXRlQnlVcmxgLlxuICAgKlxuICAgKiAjIyMgVXNhZ2VcbiAgICpcbiAgICogVGhpcyBtZXRob2QgdGFrZXMgYW4gYXJyYXkgcmVwcmVzZW50aW5nIHRoZSBSb3V0ZSBMaW5rIERTTDpcbiAgICogYGBgXG4gICAqIFsnLi9NeUNtcCcsIHtwYXJhbTogM31dXG4gICAqIGBgYFxuICAgKiBTZWUgdGhlIHtAbGluayBSb3V0ZXJMaW5rfSBkaXJlY3RpdmUgZm9yIG1vcmUuXG4gICAqL1xuICBuYXZpZ2F0ZShsaW5rUGFyYW1zOiBhbnlbXSk6IFByb21pc2U8YW55PiB7XG4gICAgdmFyIGluc3RydWN0aW9uID0gdGhpcy5nZW5lcmF0ZShsaW5rUGFyYW1zKTtcbiAgICByZXR1cm4gdGhpcy5uYXZpZ2F0ZUJ5SW5zdHJ1Y3Rpb24oaW5zdHJ1Y3Rpb24sIGZhbHNlKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIE5hdmlnYXRlIHRvIGEgVVJMLiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gbmF2aWdhdGlvbiBpcyBjb21wbGV0ZS5cbiAgICogSXQncyBwcmVmZXJyZWQgdG8gbmF2aWdhdGUgd2l0aCBgbmF2aWdhdGVgIGluc3RlYWQgb2YgdGhpcyBtZXRob2QsIHNpbmNlIFVSTHMgYXJlIG1vcmUgYnJpdHRsZS5cbiAgICpcbiAgICogSWYgdGhlIGdpdmVuIFVSTCBiZWdpbnMgd2l0aCBhIGAvYCwgcm91dGVyIHdpbGwgbmF2aWdhdGUgYWJzb2x1dGVseS5cbiAgICogSWYgdGhlIGdpdmVuIFVSTCBkb2VzIG5vdCBiZWdpbiB3aXRoIGAvYCwgdGhlIHJvdXRlciB3aWxsIG5hdmlnYXRlIHJlbGF0aXZlIHRvIHRoaXMgY29tcG9uZW50LlxuICAgKi9cbiAgbmF2aWdhdGVCeVVybCh1cmw6IHN0cmluZywgX3NraXBMb2NhdGlvbkNoYW5nZTogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudE5hdmlnYXRpb24gPSB0aGlzLl9jdXJyZW50TmF2aWdhdGlvbi50aGVuKChfKSA9PiB7XG4gICAgICB0aGlzLmxhc3ROYXZpZ2F0aW9uQXR0ZW1wdCA9IHVybDtcbiAgICAgIHRoaXMuX3N0YXJ0TmF2aWdhdGluZygpO1xuICAgICAgcmV0dXJuIHRoaXMuX2FmdGVyUHJvbWlzZUZpbmlzaE5hdmlnYXRpbmcodGhpcy5yZWNvZ25pemUodXJsKS50aGVuKChpbnN0cnVjdGlvbikgPT4ge1xuICAgICAgICBpZiAoaXNCbGFuayhpbnN0cnVjdGlvbikpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX25hdmlnYXRlKGluc3RydWN0aW9uLCBfc2tpcExvY2F0aW9uQ2hhbmdlKTtcbiAgICAgIH0pKTtcbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIE5hdmlnYXRlIHZpYSB0aGUgcHJvdmlkZWQgaW5zdHJ1Y3Rpb24uIFJldHVybnMgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiBuYXZpZ2F0aW9uIGlzXG4gICAqIGNvbXBsZXRlLlxuICAgKi9cbiAgbmF2aWdhdGVCeUluc3RydWN0aW9uKGluc3RydWN0aW9uOiBJbnN0cnVjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIF9za2lwTG9jYXRpb25DaGFuZ2U6IGJvb2xlYW4gPSBmYWxzZSk6IFByb21pc2U8YW55PiB7XG4gICAgaWYgKGlzQmxhbmsoaW5zdHJ1Y3Rpb24pKSB7XG4gICAgICByZXR1cm4gX3Jlc29sdmVUb0ZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fY3VycmVudE5hdmlnYXRpb24gPSB0aGlzLl9jdXJyZW50TmF2aWdhdGlvbi50aGVuKChfKSA9PiB7XG4gICAgICB0aGlzLl9zdGFydE5hdmlnYXRpbmcoKTtcbiAgICAgIHJldHVybiB0aGlzLl9hZnRlclByb21pc2VGaW5pc2hOYXZpZ2F0aW5nKHRoaXMuX25hdmlnYXRlKGluc3RydWN0aW9uLCBfc2tpcExvY2F0aW9uQ2hhbmdlKSk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9zZXR0bGVJbnN0cnVjdGlvbihpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24pOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiBpbnN0cnVjdGlvbi5yZXNvbHZlQ29tcG9uZW50KCkudGhlbigoXykgPT4ge1xuICAgICAgdmFyIHVuc2V0dGxlZEluc3RydWN0aW9uczogQXJyYXk8UHJvbWlzZTxhbnk+PiA9IFtdO1xuXG4gICAgICBpZiAoaXNQcmVzZW50KGluc3RydWN0aW9uLmNvbXBvbmVudCkpIHtcbiAgICAgICAgaW5zdHJ1Y3Rpb24uY29tcG9uZW50LnJldXNlID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGlmIChpc1ByZXNlbnQoaW5zdHJ1Y3Rpb24uY2hpbGQpKSB7XG4gICAgICAgIHVuc2V0dGxlZEluc3RydWN0aW9ucy5wdXNoKHRoaXMuX3NldHRsZUluc3RydWN0aW9uKGluc3RydWN0aW9uLmNoaWxkKSk7XG4gICAgICB9XG5cbiAgICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaChpbnN0cnVjdGlvbi5hdXhJbnN0cnVjdGlvbiwgKGluc3RydWN0aW9uOiBJbnN0cnVjdGlvbiwgXykgPT4ge1xuICAgICAgICB1bnNldHRsZWRJbnN0cnVjdGlvbnMucHVzaCh0aGlzLl9zZXR0bGVJbnN0cnVjdGlvbihpbnN0cnVjdGlvbikpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIuYWxsKHVuc2V0dGxlZEluc3RydWN0aW9ucyk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9uYXZpZ2F0ZShpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24sIF9za2lwTG9jYXRpb25DaGFuZ2U6IGJvb2xlYW4pOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiB0aGlzLl9zZXR0bGVJbnN0cnVjdGlvbihpbnN0cnVjdGlvbilcbiAgICAgICAgLnRoZW4oKF8pID0+IHRoaXMuX3JvdXRlckNhblJldXNlKGluc3RydWN0aW9uKSlcbiAgICAgICAgLnRoZW4oKF8pID0+IHRoaXMuX2NhbkFjdGl2YXRlKGluc3RydWN0aW9uKSlcbiAgICAgICAgLnRoZW4oKHJlc3VsdDogYm9vbGVhbikgPT4ge1xuICAgICAgICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aGlzLl9yb3V0ZXJDYW5EZWFjdGl2YXRlKGluc3RydWN0aW9uKVxuICAgICAgICAgICAgICAudGhlbigocmVzdWx0OiBib29sZWFuKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29tbWl0KGluc3RydWN0aW9uLCBfc2tpcExvY2F0aW9uQ2hhbmdlKVxuICAgICAgICAgICAgICAgICAgICAgIC50aGVuKChfKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9lbWl0TmF2aWdhdGlvbkZpbmlzaChpbnN0cnVjdGlvbi50b1Jvb3RVcmwoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2VtaXROYXZpZ2F0aW9uRmluaXNoKHVybCk6IHZvaWQgeyBPYnNlcnZhYmxlV3JhcHBlci5jYWxsRW1pdCh0aGlzLl9zdWJqZWN0LCB1cmwpOyB9XG4gIF9lbWl0TmF2aWdhdGlvbkZhaWwodXJsKTogdm9pZCB7IE9ic2VydmFibGVXcmFwcGVyLmNhbGxFcnJvcih0aGlzLl9zdWJqZWN0LCB1cmwpOyB9XG5cbiAgcHJpdmF0ZSBfYWZ0ZXJQcm9taXNlRmluaXNoTmF2aWdhdGluZyhwcm9taXNlOiBQcm9taXNlPGFueT4pOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiBQcm9taXNlV3JhcHBlci5jYXRjaEVycm9yKHByb21pc2UudGhlbigoXykgPT4gdGhpcy5fZmluaXNoTmF2aWdhdGluZygpKSwgKGVycikgPT4ge1xuICAgICAgdGhpcy5fZmluaXNoTmF2aWdhdGluZygpO1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH0pO1xuICB9XG5cbiAgLypcbiAgICogUmVjdXJzaXZlbHkgc2V0IHJldXNlIGZsYWdzXG4gICAqL1xuICAvKiogQGludGVybmFsICovXG4gIF9yb3V0ZXJDYW5SZXVzZShpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24pOiBQcm9taXNlPGFueT4ge1xuICAgIGlmIChpc0JsYW5rKHRoaXMuX291dGxldCkpIHtcbiAgICAgIHJldHVybiBfcmVzb2x2ZVRvRmFsc2U7XG4gICAgfVxuICAgIGlmIChpc0JsYW5rKGluc3RydWN0aW9uLmNvbXBvbmVudCkpIHtcbiAgICAgIHJldHVybiBfcmVzb2x2ZVRvVHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX291dGxldC5yb3V0ZXJDYW5SZXVzZShpbnN0cnVjdGlvbi5jb21wb25lbnQpXG4gICAgICAgIC50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICBpbnN0cnVjdGlvbi5jb21wb25lbnQucmV1c2UgPSByZXN1bHQ7XG4gICAgICAgICAgaWYgKHJlc3VsdCAmJiBpc1ByZXNlbnQodGhpcy5fY2hpbGRSb3V0ZXIpICYmIGlzUHJlc2VudChpbnN0cnVjdGlvbi5jaGlsZCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jaGlsZFJvdXRlci5fcm91dGVyQ2FuUmV1c2UoaW5zdHJ1Y3Rpb24uY2hpbGQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9jYW5BY3RpdmF0ZShuZXh0SW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIGNhbkFjdGl2YXRlT25lKG5leHRJbnN0cnVjdGlvbiwgdGhpcy5jdXJyZW50SW5zdHJ1Y3Rpb24pO1xuICB9XG5cbiAgcHJpdmF0ZSBfcm91dGVyQ2FuRGVhY3RpdmF0ZShpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBpZiAoaXNCbGFuayh0aGlzLl9vdXRsZXQpKSB7XG4gICAgICByZXR1cm4gX3Jlc29sdmVUb1RydWU7XG4gICAgfVxuICAgIHZhciBuZXh0OiBQcm9taXNlPGJvb2xlYW4+O1xuICAgIHZhciBjaGlsZEluc3RydWN0aW9uOiBJbnN0cnVjdGlvbiA9IG51bGw7XG4gICAgdmFyIHJldXNlOiBib29sZWFuID0gZmFsc2U7XG4gICAgdmFyIGNvbXBvbmVudEluc3RydWN0aW9uOiBDb21wb25lbnRJbnN0cnVjdGlvbiA9IG51bGw7XG4gICAgaWYgKGlzUHJlc2VudChpbnN0cnVjdGlvbikpIHtcbiAgICAgIGNoaWxkSW5zdHJ1Y3Rpb24gPSBpbnN0cnVjdGlvbi5jaGlsZDtcbiAgICAgIGNvbXBvbmVudEluc3RydWN0aW9uID0gaW5zdHJ1Y3Rpb24uY29tcG9uZW50O1xuICAgICAgcmV1c2UgPSBpc0JsYW5rKGluc3RydWN0aW9uLmNvbXBvbmVudCkgfHwgaW5zdHJ1Y3Rpb24uY29tcG9uZW50LnJldXNlO1xuICAgIH1cbiAgICBpZiAocmV1c2UpIHtcbiAgICAgIG5leHQgPSBfcmVzb2x2ZVRvVHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV4dCA9IHRoaXMuX291dGxldC5yb3V0ZXJDYW5EZWFjdGl2YXRlKGNvbXBvbmVudEluc3RydWN0aW9uKTtcbiAgICB9XG4gICAgLy8gVE9ETzogYXV4IHJvdXRlIGxpZmVjeWNsZSBob29rc1xuICAgIHJldHVybiBuZXh0LnRoZW48Ym9vbGVhbj4oKHJlc3VsdCk6IGJvb2xlYW4gfCBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICAgIGlmIChyZXN1bHQgPT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKGlzUHJlc2VudCh0aGlzLl9jaGlsZFJvdXRlcikpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NoaWxkUm91dGVyLl9yb3V0ZXJDYW5EZWFjdGl2YXRlKGNoaWxkSW5zdHJ1Y3Rpb24pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGlzIHJvdXRlciBhbmQgYWxsIGRlc2NlbmRhbnQgcm91dGVycyBhY2NvcmRpbmcgdG8gdGhlIGdpdmVuIGluc3RydWN0aW9uXG4gICAqL1xuICBjb21taXQoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uLCBfc2tpcExvY2F0aW9uQ2hhbmdlOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPGFueT4ge1xuICAgIHRoaXMuY3VycmVudEluc3RydWN0aW9uID0gaW5zdHJ1Y3Rpb247XG5cbiAgICB2YXIgbmV4dDogUHJvbWlzZTxhbnk+ID0gX3Jlc29sdmVUb1RydWU7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9vdXRsZXQpICYmIGlzUHJlc2VudChpbnN0cnVjdGlvbi5jb21wb25lbnQpKSB7XG4gICAgICB2YXIgY29tcG9uZW50SW5zdHJ1Y3Rpb24gPSBpbnN0cnVjdGlvbi5jb21wb25lbnQ7XG4gICAgICBpZiAoY29tcG9uZW50SW5zdHJ1Y3Rpb24ucmV1c2UpIHtcbiAgICAgICAgbmV4dCA9IHRoaXMuX291dGxldC5yZXVzZShjb21wb25lbnRJbnN0cnVjdGlvbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXh0ID1cbiAgICAgICAgICAgIHRoaXMuZGVhY3RpdmF0ZShpbnN0cnVjdGlvbikudGhlbigoXykgPT4gdGhpcy5fb3V0bGV0LmFjdGl2YXRlKGNvbXBvbmVudEluc3RydWN0aW9uKSk7XG4gICAgICB9XG4gICAgICBpZiAoaXNQcmVzZW50KGluc3RydWN0aW9uLmNoaWxkKSkge1xuICAgICAgICBuZXh0ID0gbmV4dC50aGVuKChfKSA9PiB7XG4gICAgICAgICAgaWYgKGlzUHJlc2VudCh0aGlzLl9jaGlsZFJvdXRlcikpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jaGlsZFJvdXRlci5jb21taXQoaW5zdHJ1Y3Rpb24uY2hpbGQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHByb21pc2VzOiBQcm9taXNlPGFueT5bXSA9IFtdO1xuICAgIHRoaXMuX2F1eFJvdXRlcnMuZm9yRWFjaCgocm91dGVyLCBuYW1lKSA9PiB7XG4gICAgICBpZiAoaXNQcmVzZW50KGluc3RydWN0aW9uLmF1eEluc3RydWN0aW9uW25hbWVdKSkge1xuICAgICAgICBwcm9taXNlcy5wdXNoKHJvdXRlci5jb21taXQoaW5zdHJ1Y3Rpb24uYXV4SW5zdHJ1Y3Rpb25bbmFtZV0pKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBuZXh0LnRoZW4oKF8pID0+IFByb21pc2VXcmFwcGVyLmFsbChwcm9taXNlcykpO1xuICB9XG5cblxuICAvKiogQGludGVybmFsICovXG4gIF9zdGFydE5hdmlnYXRpbmcoKTogdm9pZCB7IHRoaXMubmF2aWdhdGluZyA9IHRydWU7IH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9maW5pc2hOYXZpZ2F0aW5nKCk6IHZvaWQgeyB0aGlzLm5hdmlnYXRpbmcgPSBmYWxzZTsgfVxuXG5cbiAgLyoqXG4gICAqIFN1YnNjcmliZSB0byBVUkwgdXBkYXRlcyBmcm9tIHRoZSByb3V0ZXJcbiAgICovXG4gIHN1YnNjcmliZShvbk5leHQ6ICh2YWx1ZTogYW55KSA9PiB2b2lkLCBvbkVycm9yPzogKHZhbHVlOiBhbnkpID0+IHZvaWQpOiBPYmplY3Qge1xuICAgIHJldHVybiBPYnNlcnZhYmxlV3JhcHBlci5zdWJzY3JpYmUodGhpcy5fc3ViamVjdCwgb25OZXh0LCBvbkVycm9yKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIGNvbnRlbnRzIG9mIHRoaXMgcm91dGVyJ3Mgb3V0bGV0IGFuZCBhbGwgZGVzY2VuZGFudCBvdXRsZXRzXG4gICAqL1xuICBkZWFjdGl2YXRlKGluc3RydWN0aW9uOiBJbnN0cnVjdGlvbik6IFByb21pc2U8YW55PiB7XG4gICAgdmFyIGNoaWxkSW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uID0gbnVsbDtcbiAgICB2YXIgY29tcG9uZW50SW5zdHJ1Y3Rpb246IENvbXBvbmVudEluc3RydWN0aW9uID0gbnVsbDtcbiAgICBpZiAoaXNQcmVzZW50KGluc3RydWN0aW9uKSkge1xuICAgICAgY2hpbGRJbnN0cnVjdGlvbiA9IGluc3RydWN0aW9uLmNoaWxkO1xuICAgICAgY29tcG9uZW50SW5zdHJ1Y3Rpb24gPSBpbnN0cnVjdGlvbi5jb21wb25lbnQ7XG4gICAgfVxuICAgIHZhciBuZXh0OiBQcm9taXNlPGFueT4gPSBfcmVzb2x2ZVRvVHJ1ZTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2NoaWxkUm91dGVyKSkge1xuICAgICAgbmV4dCA9IHRoaXMuX2NoaWxkUm91dGVyLmRlYWN0aXZhdGUoY2hpbGRJbnN0cnVjdGlvbik7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fb3V0bGV0KSkge1xuICAgICAgbmV4dCA9IG5leHQudGhlbigoXykgPT4gdGhpcy5fb3V0bGV0LmRlYWN0aXZhdGUoY29tcG9uZW50SW5zdHJ1Y3Rpb24pKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBoYW5kbGUgYXV4IHJvdXRlc1xuXG4gICAgcmV0dXJuIG5leHQ7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIFVSTCwgcmV0dXJucyBhbiBpbnN0cnVjdGlvbiByZXByZXNlbnRpbmcgdGhlIGNvbXBvbmVudCBncmFwaFxuICAgKi9cbiAgcmVjb2duaXplKHVybDogc3RyaW5nKTogUHJvbWlzZTxJbnN0cnVjdGlvbj4ge1xuICAgIHZhciBhbmNlc3RvckNvbXBvbmVudHMgPSB0aGlzLl9nZXRBbmNlc3Rvckluc3RydWN0aW9ucygpO1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdHJ5LnJlY29nbml6ZSh1cmwsIGFuY2VzdG9yQ29tcG9uZW50cyk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRBbmNlc3Rvckluc3RydWN0aW9ucygpOiBJbnN0cnVjdGlvbltdIHtcbiAgICB2YXIgYW5jZXN0b3JJbnN0cnVjdGlvbnM6IEluc3RydWN0aW9uW10gPSBbdGhpcy5jdXJyZW50SW5zdHJ1Y3Rpb25dO1xuICAgIHZhciBhbmNlc3RvclJvdXRlcjogUm91dGVyID0gdGhpcztcbiAgICB3aGlsZSAoaXNQcmVzZW50KGFuY2VzdG9yUm91dGVyID0gYW5jZXN0b3JSb3V0ZXIucGFyZW50KSkge1xuICAgICAgYW5jZXN0b3JJbnN0cnVjdGlvbnMudW5zaGlmdChhbmNlc3RvclJvdXRlci5jdXJyZW50SW5zdHJ1Y3Rpb24pO1xuICAgIH1cbiAgICByZXR1cm4gYW5jZXN0b3JJbnN0cnVjdGlvbnM7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBOYXZpZ2F0ZXMgdG8gZWl0aGVyIHRoZSBsYXN0IFVSTCBzdWNjZXNzZnVsbHkgbmF2aWdhdGVkIHRvLCBvciB0aGUgbGFzdCBVUkwgcmVxdWVzdGVkIGlmIHRoZVxuICAgKiByb3V0ZXIgaGFzIHlldCB0byBzdWNjZXNzZnVsbHkgbmF2aWdhdGUuXG4gICAqL1xuICByZW5hdmlnYXRlKCk6IFByb21pc2U8YW55PiB7XG4gICAgaWYgKGlzQmxhbmsodGhpcy5sYXN0TmF2aWdhdGlvbkF0dGVtcHQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY3VycmVudE5hdmlnYXRpb247XG4gICAgfVxuICAgIHJldHVybiB0aGlzLm5hdmlnYXRlQnlVcmwodGhpcy5sYXN0TmF2aWdhdGlvbkF0dGVtcHQpO1xuICB9XG5cblxuICAvKipcbiAgICogR2VuZXJhdGUgYW4gYEluc3RydWN0aW9uYCBiYXNlZCBvbiB0aGUgcHJvdmlkZWQgUm91dGUgTGluayBEU0wuXG4gICAqL1xuICBnZW5lcmF0ZShsaW5rUGFyYW1zOiBhbnlbXSk6IEluc3RydWN0aW9uIHtcbiAgICB2YXIgYW5jZXN0b3JJbnN0cnVjdGlvbnMgPSB0aGlzLl9nZXRBbmNlc3Rvckluc3RydWN0aW9ucygpO1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdHJ5LmdlbmVyYXRlKGxpbmtQYXJhbXMsIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zKTtcbiAgfVxufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUm9vdFJvdXRlciBleHRlbmRzIFJvdXRlciB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2xvY2F0aW9uOiBMb2NhdGlvbjtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbG9jYXRpb25TdWI6IE9iamVjdDtcblxuICBjb25zdHJ1Y3RvcihyZWdpc3RyeTogUm91dGVSZWdpc3RyeSwgbG9jYXRpb246IExvY2F0aW9uLFxuICAgICAgICAgICAgICBASW5qZWN0KFJPVVRFUl9QUklNQVJZX0NPTVBPTkVOVCkgcHJpbWFyeUNvbXBvbmVudDogVHlwZSkge1xuICAgIHN1cGVyKHJlZ2lzdHJ5LCBudWxsLCBwcmltYXJ5Q29tcG9uZW50KTtcbiAgICB0aGlzLnJvb3QgPSB0aGlzO1xuICAgIHRoaXMuX2xvY2F0aW9uID0gbG9jYXRpb247XG4gICAgdGhpcy5fbG9jYXRpb25TdWIgPSB0aGlzLl9sb2NhdGlvbi5zdWJzY3JpYmUoKGNoYW5nZSkgPT4ge1xuICAgICAgLy8gd2UgY2FsbCByZWNvZ25pemUgb3Vyc2VsdmVzXG4gICAgICB0aGlzLnJlY29nbml6ZShjaGFuZ2VbJ3VybCddKVxuICAgICAgICAgIC50aGVuKChpbnN0cnVjdGlvbikgPT4ge1xuICAgICAgICAgICAgaWYgKGlzUHJlc2VudChpbnN0cnVjdGlvbikpIHtcbiAgICAgICAgICAgICAgdGhpcy5uYXZpZ2F0ZUJ5SW5zdHJ1Y3Rpb24oaW5zdHJ1Y3Rpb24sIGlzUHJlc2VudChjaGFuZ2VbJ3BvcCddKSlcbiAgICAgICAgICAgICAgICAgIC50aGVuKChfKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMgaXMgYSBwb3BzdGF0ZSBldmVudDsgbm8gbmVlZCB0byBjaGFuZ2UgdGhlIFVSTFxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNQcmVzZW50KGNoYW5nZVsncG9wJ10pICYmIGNoYW5nZVsndHlwZSddICE9ICdoYXNoY2hhbmdlJykge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB2YXIgZW1pdFBhdGggPSBpbnN0cnVjdGlvbi50b1VybFBhdGgoKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVtaXRRdWVyeSA9IGluc3RydWN0aW9uLnRvVXJsUXVlcnkoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVtaXRQYXRoLmxlbmd0aCA+IDAgJiYgZW1pdFBhdGhbMF0gIT0gJy8nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgZW1pdFBhdGggPSAnLycgKyBlbWl0UGF0aDtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIEJlY2F1c2Ugd2UndmUgb3B0ZWQgdG8gdXNlIEFsbCBoYXNoY2hhbmdlIGV2ZW50cyBvY2N1ciBvdXRzaWRlIEFuZ3VsYXIuXG4gICAgICAgICAgICAgICAgICAgIC8vIEhvd2V2ZXIsIGFwcHMgdGhhdCBhcmUgbWlncmF0aW5nIG1pZ2h0IGhhdmUgaGFzaCBsaW5rcyB0aGF0IG9wZXJhdGUgb3V0c2lkZVxuICAgICAgICAgICAgICAgICAgICAvLyBhbmd1bGFyIHRvIHdoaWNoIHJvdXRpbmcgbXVzdCByZXNwb25kLlxuICAgICAgICAgICAgICAgICAgICAvLyBUbyBzdXBwb3J0IHRoZXNlIGNhc2VzIHdoZXJlIHdlIHJlc3BvbmQgdG8gaGFzaGNoYW5nZXMgYW5kIHJlZGlyZWN0IGFzIGFcbiAgICAgICAgICAgICAgICAgICAgLy8gcmVzdWx0LCB3ZSBuZWVkIHRvIHJlcGxhY2UgdGhlIHRvcCBpdGVtIG9uIHRoZSBzdGFjay5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoYW5nZVsndHlwZSddID09ICdoYXNoY2hhbmdlJykge1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChpbnN0cnVjdGlvbi50b1Jvb3RVcmwoKSAhPSB0aGlzLl9sb2NhdGlvbi5wYXRoKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvY2F0aW9uLnJlcGxhY2VTdGF0ZShlbWl0UGF0aCwgZW1pdFF1ZXJ5KTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5fbG9jYXRpb24uZ28oZW1pdFBhdGgsIGVtaXRRdWVyeSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhpcy5fZW1pdE5hdmlnYXRpb25GYWlsKGNoYW5nZVsndXJsJ10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5yZWdpc3RyeS5jb25maWdGcm9tQ29tcG9uZW50KHByaW1hcnlDb21wb25lbnQpO1xuICAgIHRoaXMubmF2aWdhdGVCeVVybChsb2NhdGlvbi5wYXRoKCkpO1xuICB9XG5cbiAgY29tbWl0KGluc3RydWN0aW9uOiBJbnN0cnVjdGlvbiwgX3NraXBMb2NhdGlvbkNoYW5nZTogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTxhbnk+IHtcbiAgICB2YXIgZW1pdFBhdGggPSBpbnN0cnVjdGlvbi50b1VybFBhdGgoKTtcbiAgICB2YXIgZW1pdFF1ZXJ5ID0gaW5zdHJ1Y3Rpb24udG9VcmxRdWVyeSgpO1xuICAgIGlmIChlbWl0UGF0aC5sZW5ndGggPiAwICYmIGVtaXRQYXRoWzBdICE9ICcvJykge1xuICAgICAgZW1pdFBhdGggPSAnLycgKyBlbWl0UGF0aDtcbiAgICB9XG4gICAgdmFyIHByb21pc2UgPSBzdXBlci5jb21taXQoaW5zdHJ1Y3Rpb24pO1xuICAgIGlmICghX3NraXBMb2NhdGlvbkNoYW5nZSkge1xuICAgICAgcHJvbWlzZSA9IHByb21pc2UudGhlbigoXykgPT4geyB0aGlzLl9sb2NhdGlvbi5nbyhlbWl0UGF0aCwgZW1pdFF1ZXJ5KTsgfSk7XG4gICAgfVxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2xvY2F0aW9uU3ViKSkge1xuICAgICAgT2JzZXJ2YWJsZVdyYXBwZXIuZGlzcG9zZSh0aGlzLl9sb2NhdGlvblN1Yik7XG4gICAgICB0aGlzLl9sb2NhdGlvblN1YiA9IG51bGw7XG4gICAgfVxuICB9XG59XG5cbmNsYXNzIENoaWxkUm91dGVyIGV4dGVuZHMgUm91dGVyIHtcbiAgY29uc3RydWN0b3IocGFyZW50OiBSb3V0ZXIsIGhvc3RDb21wb25lbnQpIHtcbiAgICBzdXBlcihwYXJlbnQucmVnaXN0cnksIHBhcmVudCwgaG9zdENvbXBvbmVudCwgcGFyZW50LnJvb3QpO1xuICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xuICB9XG5cblxuICBuYXZpZ2F0ZUJ5VXJsKHVybDogc3RyaW5nLCBfc2tpcExvY2F0aW9uQ2hhbmdlOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPGFueT4ge1xuICAgIC8vIERlbGVnYXRlIG5hdmlnYXRpb24gdG8gdGhlIHJvb3Qgcm91dGVyXG4gICAgcmV0dXJuIHRoaXMucGFyZW50Lm5hdmlnYXRlQnlVcmwodXJsLCBfc2tpcExvY2F0aW9uQ2hhbmdlKTtcbiAgfVxuXG4gIG5hdmlnYXRlQnlJbnN0cnVjdGlvbihpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBfc2tpcExvY2F0aW9uQ2hhbmdlOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPGFueT4ge1xuICAgIC8vIERlbGVnYXRlIG5hdmlnYXRpb24gdG8gdGhlIHJvb3Qgcm91dGVyXG4gICAgcmV0dXJuIHRoaXMucGFyZW50Lm5hdmlnYXRlQnlJbnN0cnVjdGlvbihpbnN0cnVjdGlvbiwgX3NraXBMb2NhdGlvbkNoYW5nZSk7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBjYW5BY3RpdmF0ZU9uZShuZXh0SW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldkluc3RydWN0aW9uOiBJbnN0cnVjdGlvbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICB2YXIgbmV4dCA9IF9yZXNvbHZlVG9UcnVlO1xuICBpZiAoaXNCbGFuayhuZXh0SW5zdHJ1Y3Rpb24uY29tcG9uZW50KSkge1xuICAgIHJldHVybiBuZXh0O1xuICB9XG4gIGlmIChpc1ByZXNlbnQobmV4dEluc3RydWN0aW9uLmNoaWxkKSkge1xuICAgIG5leHQgPSBjYW5BY3RpdmF0ZU9uZShuZXh0SW5zdHJ1Y3Rpb24uY2hpbGQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlzUHJlc2VudChwcmV2SW5zdHJ1Y3Rpb24pID8gcHJldkluc3RydWN0aW9uLmNoaWxkIDogbnVsbCk7XG4gIH1cbiAgcmV0dXJuIG5leHQudGhlbjxib29sZWFuPigocmVzdWx0OiBib29sZWFuKTogYm9vbGVhbiA9PiB7XG4gICAgaWYgKHJlc3VsdCA9PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAobmV4dEluc3RydWN0aW9uLmNvbXBvbmVudC5yZXVzZSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHZhciBob29rID0gZ2V0Q2FuQWN0aXZhdGVIb29rKG5leHRJbnN0cnVjdGlvbi5jb21wb25lbnQuY29tcG9uZW50VHlwZSk7XG4gICAgaWYgKGlzUHJlc2VudChob29rKSkge1xuICAgICAgcmV0dXJuIGhvb2sobmV4dEluc3RydWN0aW9uLmNvbXBvbmVudCxcbiAgICAgICAgICAgICAgICAgIGlzUHJlc2VudChwcmV2SW5zdHJ1Y3Rpb24pID8gcHJldkluc3RydWN0aW9uLmNvbXBvbmVudCA6IG51bGwpO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSk7XG59XG4iXX0=