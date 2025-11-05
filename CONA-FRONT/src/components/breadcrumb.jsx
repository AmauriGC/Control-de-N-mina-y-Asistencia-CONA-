import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

export default function Breadcrumb({ homeTo = "/", items = [] }) {
  return (
    <nav className="flex items-center text-sm text-gray-500" aria-label="Breadcrumb">
      <Link
        to={homeTo}
        className="inline-flex items-center rounded-md px-2 py-1 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        title="Ir al dashboard"
      >
        <Home className="mr-1" size={16} />
      </Link>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        const content = (
          <span className={"truncate " + (isLast ? "text-gray-900" : "hover:text-gray-900")}>{item.label}</span>
        );
        return (
          <span key={idx} className="flex items-center">
            <ChevronRight className="mx-2 text-gray-300" size={16} />
            {item.to && !isLast ? (
              <Link to={item.to} className="rounded px-1 py-0.5 hover:bg-gray-100">
                {content}
              </Link>
            ) : (
              <span aria-current={isLast ? "page" : undefined}>{content}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
