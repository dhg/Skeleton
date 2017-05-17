import * as React from 'react';

export interface HelloWorldProps {
    name: string
}

export default class HelloWorldComponent extends React.Component<HelloWorldProps, any> {
    render() {
        const { name } = this.props;

        return (
            <div>
                Hello World! Good work {name}
            </div>
        );
    }
}
