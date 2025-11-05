export function Card({ className = "", children }) {
  return <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}>{children}</div>;
}

export function CardHeader({ title, description, right, className = "" }) {
  return (
    <div className={`flex items-start justify-between gap-4 border-b border-gray-100 p-4 ${className}`}>
      <div>
        {title ? <h3 className="text-base font-semibold text-gray-900">{title}</h3> : null}
        {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
      </div>
      {right}
    </div>
  );
}

export function CardContent({ className = "", children }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

export function CardFooter({ className = "", children }) {
  return <div className={`border-t border-gray-100 p-4 ${className}`}>{children}</div>;
}
