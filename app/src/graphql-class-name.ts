
export const GraphQlClassName = (className: string) => {
    return function classDecorator(constructor: Function): any {
        constructor.prototype.className = className;
    };
};
