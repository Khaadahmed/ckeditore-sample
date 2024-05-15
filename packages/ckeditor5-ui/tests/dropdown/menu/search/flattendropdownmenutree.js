/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { createTreeFromFlattenDropdownMenusList } from '../../../../src/dropdown/menu/search/createtreefromflattendropdownmenuslist.js';
import { flattenDropdownMenuTree } from '../../../../src/dropdown/menu/search/flattendropdownmenutree.js';

import { findMenuTreeNodeByLabel } from '../_utils/dropdowntreeutils.js';
import {
	createBlankRootListView,
	createMockDropdownMenuDefinition
} from '../_utils/dropdowntreemock.js';

describe( 'flattenDropdownMenuTree', () => {
	it( 'should return empty array if passed empty tree', () => {
		const { menuRootList } = createBlankRootListView();
		const tree = createTreeFromFlattenDropdownMenusList( menuRootList.definition.menus );
		const flatten = flattenDropdownMenuTree( tree );

		expect( flatten ).to.deep.equal( [] );
	} );

	it( 'should return flatten list of nodes with parents', () => {
		const { menuRootList } = createMockDropdownMenuDefinition();
		const tree = createTreeFromFlattenDropdownMenusList( menuRootList.definition.menus );
		const flatten = flattenDropdownMenuTree( tree );

		const byLabel = label => findMenuTreeNodeByLabel( label, tree );

		expect( flatten ).to.deep.equal(
			[
				{
					parents: [ tree, byLabel( 'Menu 1' ) ],
					node: byLabel( 'Foo' )
				},
				{
					parents: [ tree, byLabel( 'Menu 1' ) ],
					node: byLabel( 'Bar' )
				},
				{
					parents: [ tree, byLabel( 'Menu 1' ) ],
					node: byLabel( 'Buz' )
				},
				{
					parents: [ tree, byLabel( 'Menu 2' ) ],
					node: byLabel( 'A' )
				},
				{
					parents: [ tree, byLabel( 'Menu 2' ) ],
					node: byLabel( 'B' )
				}
			]
		);
	} );
} );
