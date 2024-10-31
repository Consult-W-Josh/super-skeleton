const { execSync } = require( 'child_process' );

const packageName = process.argv[2];

if ( !packageName ) {
	console.error( "Please provide a package name, e.g., `npm run generate-lib auth`" );
	process.exit( 1 );
}


const command = `nx g lib --publishable --importPath='@super-skeleton/${packageName}' --directory='libs/${packageName}' ${packageName}`;
execSync( command, { stdio: 'inherit' } );