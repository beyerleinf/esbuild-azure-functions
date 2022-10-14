import 'reflect-metadata';

export function Test2() {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    console.log('Test2');

    Reflect.defineMetadata('foo', { bar: 'baz' }, descriptor.value);
  };
}
