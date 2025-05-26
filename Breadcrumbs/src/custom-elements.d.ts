// src/custom-elements.d.ts
declare namespace JSX {
  interface IntrinsicElements {
    'md-outlined-text-field': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      label?: string;
      value?: string;
      type?: string;
      disabled?: boolean;
      required?: boolean;
    };
  }
}