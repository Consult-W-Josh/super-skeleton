const nx = require('@nx/eslint-plugin');

module.exports = [
	...nx.configs['flat/base'],
	...nx.configs['flat/typescript'],
	...nx.configs['flat/javascript'],
	{
		ignores: ['**/dist'],
	},
	{
		files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
		rules: {
			'@nx/enforce-module-boundaries': [
				'error',
				{
					enforceBuildableLibDependency: true,
					allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
					depConstraints: [
						{
							sourceTag: '*',
							onlyDependOnLibsWithTags: ['*'],
						},
					],
				},
			],
		},
	},
	{
		files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
		rules: {
			"semi": [2, "always"],
			"max-len": [
				"error",
				{
					"code": 120,
					"tabWidth": 4,
					"ignorePattern": "^// eslint-.+",
					"ignoreUrls": true,
					"ignoreComments": false,
					"ignoreRegExpLiterals": true,
					"ignoreStrings": true,
					"ignoreTemplateLiterals": true
				}
			],
			"no-unused-vars": "off",
			"no-console": 0,
			"no-var": "off",
			"no-tabs": ["error", { "allowIndentationTabs": true }],
			"indent": [1, "tab"],
			"keyword-spacing": "error",
			"object-curly-spacing": "off",
			"array-bracket-spacing": "off",
			"space-before-function-paren": "off",
			"no-multi-spaces": "error",
			"eqeqeq": "error",
			"no-alert": "error",
			"space-in-parens": ["error", "always"]
		},
	},
];
