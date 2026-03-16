import { ReactNode } from 'react';

interface PageHeroProps {
  badge?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}

export default function PageHero({ badge, title, description, children }: PageHeroProps) {
  return (
    <div className="page-header">
      {badge && (
        <div className="section-label">
          <span className="star">✦</span> {badge}
        </div>
      )}
      <h1 className="section-title">{title}</h1>
      {description && <p>{description}</p>}
      {children && <div className="mt-20">{children}</div>}
    </div>
  );
}
