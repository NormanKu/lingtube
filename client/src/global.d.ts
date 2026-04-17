declare module '*.css';
declare module '*.jsx';
declare module 'react';
declare module 'react/jsx-runtime';
declare module 'react-dom/client';
declare module 'react-router-dom';
declare module 'react-i18next';
declare module 'react-youtube';
declare module 'lucide-react';

declare namespace JSX {
  interface IntrinsicAttributes {
    key?: string | number;
  }

  interface IntrinsicElements {
    [elementName: string]: any;
  }
}
