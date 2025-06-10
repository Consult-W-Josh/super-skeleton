import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

export const Button: React.FC<ButtonProps> = ( {
	variant = 'primary',
	size = 'md',
	children,
	className = '',
	icon,
	...props
} ) => {
	const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-md transition-all duration-300 ease-in-out focus:outline-none';

	const sizeClasses = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2 text-base',
		lg: 'px-6 py-3 text-lg'
	};

	const variantClasses = {
		primary:
      'bg-royal-blue text-white hover:bg-royal-blue-hover hover:-translate-y-1 hover:shadow-soft',
		outline:
      'border border-royal-blue text-royal-blue hover:bg-royal-blue/5 hover:-translate-y-1',
		text: 'text-royal-blue hover:bg-royal-blue/5'
	};

	const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

	return (
		<button className={classes} {...props}>
			{icon && <span className="mr-2">{icon}</span>}
			{children}
		</button>
	);
};

export default Button;
