import 'reflect-metadata';
import { Test2 } from '../test2';

export function Test() {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    console.log('2::Test');
    Reflect.defineMetadata(Symbol('test'), '__test__', descriptor.value);
  };
}

class Foo {
  @Test()
  @Test2()
  bar() {
    return null;
  }
}

const func = () => {
  new Foo().bar();
  console.log('test');
};

func();
