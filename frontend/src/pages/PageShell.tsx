import type { ReactNode } from "react";

export default function PageShell({
  children,
  right,
}: {
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div>
      <header className="header">
        <a href="#/jobs" className="brand">Jobetix</a>
        {right ? <div className="header-right">{right}</div> : null}
      </header>
      <main className="container">{children}</main>
    </div>
  );
}

