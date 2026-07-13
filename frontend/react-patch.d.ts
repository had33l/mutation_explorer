import 'react';

declare module 'react' {
  interface HTMLAttributes<T> {
    style?: any;
    className?: string;
  }
  interface SVGAttributes<T> {
    style?: any;
    className?: string;
  }
  interface JSX {
    IntrinsicElements: {
      [elemName: string]: any;
    };
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}