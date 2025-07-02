import * as React from "react";

export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M6.5 2h11" />
    <path d="M6.5 22h11" />
    <path d="M17.5 2c0 4.2-2.5 6-5.5 6S6.5 6.2 6.5 2" />
    <path d="M6.5 22c0-4.2 2.5-6 5.5-6s5.5 1.8 5.5 6" />
    <path d="M6.5 2v2.2" />
    <path d="M17.5 2v2.2" />
    <path d="M6.5 22v-2.2" />
    <path d="M17.5 22v-2.2" />
  </svg>
);
