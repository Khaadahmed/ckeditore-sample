/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { isDropdownMenuDefinition } from '../../../../src/dropdown/menu/definition/dropdownmenudefinitionguards.js';
import { createMockMenuDefinition } from '../_utils/dropdowntreemock.js';

describe( 'isDropdownMenuDefinition', () => {
	it( 'returns false if null or undefined is passed', () => {
		expect( isDropdownMenuDefinition( null ) ).to.be.false;
		expect( isDropdownMenuDefinition( undefined ) ).to.be.false;
	} );

	it( 'returns false if non-object is passed', () => {
		expect( isDropdownMenuDefinition( 1 ) ).to.be.false;
		expect( isDropdownMenuDefinition( 'foo' ) ).to.be.false;
		expect( isDropdownMenuDefinition( true ) ).to.be.false;
	} );

	it( 'returns false if empty object is passed', () => {
		expect( isDropdownMenuDefinition( {} ) ).to.be.false;
	} );

	it( 'returns true if valid definition is passed', () => {
		const mockDefinition = createMockMenuDefinition();

		expect( isDropdownMenuDefinition( mockDefinition ) ).to.be.true;
	} );
} );
