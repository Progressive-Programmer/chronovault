import * as React from "react";

export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M5 22h14" />
    <path d="M5 2h14" />
    <path d="M17 2v6.2c0 .9-.5 1.7-1.3 2.1L12 12l-3.7-1.7C7.5 10 7 9.1 7 8.2V2" />
    <path d="M7 22v-6.2c0-.9.5-1.7 1.3-2.1L12 12l3.7 1.7c.8.4 1.3 1.2 1.3 2.1V22" />
  </svg>
);
