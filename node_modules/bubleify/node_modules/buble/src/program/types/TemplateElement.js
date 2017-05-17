import Node from '../Node.js';

export default class TemplateElement extends Node {
	initialise ( transforms ) {
		this.program.templateElements.push( this );
	}
}
