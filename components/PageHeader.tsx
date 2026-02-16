import React from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  actionButton?: React.ReactNode;
}

const PageHeader = ({
  title,
  description,
  icon,
  actionButton,
}: PageHeaderProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="p-3 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-100 shrink-0">
          {icon}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="text-gray-500 text-sm">{description}</p>
        </div>
      </div>

      {actionButton && <div className="w-full md:w-auto">{actionButton}</div>}
    </div>
  );
};

export default PageHeader;
