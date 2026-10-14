
import React from "react";

export default function PrismaLogo({
  size = 48,
  className = "",
  style = {},
}) {
  return (
    <img
      src="/images/prisma-logo.png"
      alt="PRISMA shield"
      className={className}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        display: "block",
        flexShrink: 0,
        ...style,
      }}
    />
  );
}
