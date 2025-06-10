import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ( { children, className = '' } ) => {
	return (
		<div className={`bg-white rounded-xl shadow-soft p-6 ${className}`}>
			{children}
		</div>
	);
};

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ( {
	children,
	className = ''
} ) => {
	return <div className={`mb-4 ${className}`}>{children}</div>;
};

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ( {
	children,
	className = ''
} ) => {
	return <div className={className}>{children}</div>;
};

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ( {
	children,
	className = ''
} ) => {
	return (
		<div className={`mt-4 pt-4 border-t border-slate-200 ${className}`}>
			{children}
		</div>
	);
};

export default Card;
