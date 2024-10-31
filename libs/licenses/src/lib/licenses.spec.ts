import { licenses } from './licenses';

describe( 'licenses', () => {
	it( 'should work', () => {
		expect( licenses() ).toEqual( 'licenses' );
	} );
} );
