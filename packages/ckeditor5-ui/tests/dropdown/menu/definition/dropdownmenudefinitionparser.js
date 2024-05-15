/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DropdownMenuRootListView from '../../../../src/dropdown/menu/dropdownmenurootlistview.js';
import { createMockLocale, createMockMenuDefinition } from '../_utils/dropdowntreemock.js';
import {
	createRootTree,
	mapButtonViewToFlatMenuItem,
	mapMenuViewToMenuItemByLabel
} from '../_utils/dropdowntreeutils.js';

describe( 'DropdownMenuDefinitionController', () => {
	it( 'should not crash if empty definition is passed', () => {
		expect( () => {
			parseDefinition( [] );
		} ).not.to.throw();
	} );

	describe( 'tree', () => {
		it( 'should return new tree instance every time it\'s called', () => {
			const mockDefinition = createMockMenuDefinition();
			const { definition } = parseDefinition( mockDefinition );

			expect( definition.tree ).not.to.be.equal( definition.tree );
		} );

		it( 'create proper tree for plain menu definition (single definition item)', () => {
			const mockDefinition = createMockMenuDefinition();
			const { definition } = parseDefinition( mockDefinition );
			const { tree } = definition;

			expect( tree ).to.be.deep.equal(
				createRootTree( [
					mapMenuViewToMenuItemByLabel(
						'Menu 1',
						tree,
						[
							...mockDefinition.groups[ 0 ].items,
							...mockDefinition.groups[ 1 ].items
						].map( mapButtonViewToFlatMenuItem )
					)
				] )
			);
		} );

		it( 'create proper tree for plain menu definition (multiple definition items)', () => {
			const mockDefinitions = [
				createMockMenuDefinition( 'Menu 1' ),
				createMockMenuDefinition( 'Menu 2' ),
				createMockMenuDefinition( 'Menu 3' )
			];

			const { definition } = parseDefinition( mockDefinitions );
			const { tree } = definition;

			expect( tree ).to.be.deep.equal(
				createRootTree(
					mockDefinitions.map( ( mockDefinition, index ) => mapMenuViewToMenuItemByLabel(
						`Menu ${ index + 1 }`,
						tree,
						[
							...mockDefinition.groups[ 0 ].items,
							...mockDefinition.groups[ 1 ].items
						].map( mapButtonViewToFlatMenuItem )
					) )
				)
			);
		} );
	} );

	describe( 'closeAll()', () => {
		it( 'should close all menus', () => {
			const mockDefinition = createMockMenuDefinition();
			const { definition } = parseDefinition( mockDefinition );

			definition.closeAll();

			expect( definition.tree.children.some( menu => menu.isOpen ) ).to.be.false;
		} );
	} );

	function parseDefinition( definition ) {
		return new DropdownMenuRootListView(
			createMockLocale(),
			Array.isArray( definition ) ? definition : [ definition ]
		);
	}
} );
