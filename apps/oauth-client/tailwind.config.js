const { createGlobPatternsForDependencies } = require( '@nx/react/tailwind' );
const { join } = require( 'path' );

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		join(
			__dirname,
			'{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
		),
		...createGlobPatternsForDependencies( __dirname )
	],
	theme: {
		extend: {
			colors: {
				alabaster: '#f8f9fa',
				white: '#ffffff',
				charcoal: '#343a40',
				'cool-gray': '#6c757d',
				'royal-blue': '#0052cc',
				'royal-blue-hover': '#0065ff',
				'slate-200': '#e2e8f0'
			},
			fontFamily: {
				sans: [
					'Inter',
					'ui-sans-serif',
					'system-ui',
					'-apple-system',
					'BlinkMacSystemFont',
					'Segoe UI',
					'Roboto',
					'Helvetica Neue',
					'Arial',
					'sans-serif'
				]
			},
			boxShadow: {
				soft: '0 4px 12px rgba(0, 0, 0, 0.08)'
			}
		}
	},
	plugins: []
};
