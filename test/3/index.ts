import 'reflect-metadata';

export function Test() {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    console.log('3::Test');

    Reflect.defineMetadata(Symbol('test'), '__test__', descriptor.value);
  };
}

class Foo {
  @Test()
  bar() {
    return null;
  }
}

const func = () => {
  new Foo().bar();
  console.log('test');
};

func();
