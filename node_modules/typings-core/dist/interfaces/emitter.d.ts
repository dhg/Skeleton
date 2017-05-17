import { EventEmitter } from 'events';
import { Dependencies } from './config';
import { DependencyTree } from './dependencies';
export interface Emitter extends EventEmitter {
    on(event: 'reference', listener: (e: ReferenceEvent) => any): this;
    on(event: 'resolve', listener: (e: ResolveEvent) => any): this;
    on(event: 'resolved', listener: (e: ResolvedEvent) => any): this;
    on(event: 'enoent', listener: (e: EnoentEvent) => any): this;
    on(event: 'compile', listener: (e: CompileEvent) => any): this;
    on(event: 'compiled', listener: (e: CompiledEvent) => any): this;
    on(event: 'hastypings', listener: (e: HasTypingsEvent) => any): this;
    on(event: 'postmessage', listener: (e: PostMessageEvent) => any): this;
    on(event: 'ambientdependencies', listener: (e: AmbientDependenciesEvent) => any): this;
    on(event: 'badlocation', listener: (e: BadLocationEvent) => any): this;
    on(event: 'deprecated', listener: (e: DeprecatedEvent) => any): this;
    on(event: string, listener: Function): this;
    emit(event: 'reference', e: ReferenceEvent): boolean;
    emit(event: 'resolve', e: ResolveEvent): boolean;
    emit(event: 'resolved', e: ResolvedEvent): boolean;
    emit(event: 'enoent', e: EnoentEvent): boolean;
    emit(event: 'compile', e: CompileEvent): boolean;
    emit(event: 'compiled', e: CompiledEvent): boolean;
    emit(event: 'hastypings', e: HasTypingsEvent): boolean;
    emit(event: 'postmessage', e: PostMessageEvent): boolean;
    emit(event: 'ambientdependencies', e: AmbientDependenciesEvent): boolean;
    emit(event: 'badlocation', e: BadLocationEvent): boolean;
    emit(event: 'deprecated', e: DeprecatedEvent): boolean;
    emit(event: string, ...args: any[]): boolean;
}
export interface ReferenceEvent {
    name: string;
    path: string;
    tree: DependencyTree;
    browser: boolean;
    reference: string;
}
export interface ResolveEvent {
    src: string;
    raw: string;
    parent?: DependencyTree;
}
export interface ResolvedEvent extends ResolveEvent {
    tree: DependencyTree;
}
export interface EnoentEvent {
    path: string;
}
export interface CompileEvent {
    name: string;
    path: string;
    tree: DependencyTree;
    browser: boolean;
}
export interface CompiledEvent extends CompileEvent {
    contents: string;
}
export interface HasTypingsEvent {
    source: string;
    name: string;
    path: string;
    typings: string;
}
export interface PostMessageEvent {
    name: string;
    message: string;
}
export interface AmbientDependenciesEvent {
    name: string;
    raw: string;
    dependencies: Dependencies;
}
export interface BadLocationEvent {
    type: string;
    raw: string;
    location: string;
}
export interface DeprecatedEvent {
    raw: string;
    date: Date;
    parent: DependencyTree;
}
