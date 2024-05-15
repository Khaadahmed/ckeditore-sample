/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DropdownMenuListItemButtonView from '../../../../src/dropdown/menu/dropdownmenulistitembuttonview.js';
import DropdownMenuView from '../../../../src/dropdown/menu/dropdownmenuview.js';

import { createTreeFromFlattenDropdownMenusList } from '../../../../src/dropdown/menu/search/createtreefromflattendropdownmenuslist.js';

import { createBlankRootListView, createMockDropdownMenuDefinition } from '../_utils/dropdowntreemock.js';
import {
	createRootTree,
	mapButtonViewToMenuItem,
	mapMenuViewToMenuItem,
	mapMenuViewToMenuItemByLabel
} from '../_utils/dropdowntreeutils.js';

describe( 'createTreeFromFlattenDropdownMenusList', () => {
	it( 'should handle empty menus array', () => {
		const result = createTreeFromFlattenDropdownMenusList( [] );

		expect( result ).deep.equal( createRootTree() );
	} );

	it( 'should create flatten list of menus', () => {
		const { menusDefinitions, menuRootList } = createMockDropdownMenuDefinition();
		const tree = createTreeFromFlattenDropdownMenusList( menuRootList.definition.menus );

		expect( tree ).to.deep.equal(
			createRootTree( [
				mapMenuViewToMenuItemByLabel(
					'Menu 1', tree,
					[
						...menusDefinitions[ 0 ].groups[ 0 ].items,
						...menusDefinitions[ 0 ].groups[ 1 ].items
					].map( mapButtonViewToMenuItem )
				),

				mapMenuViewToMenuItemByLabel(
					'Menu 2', tree,
					menusDefinitions[ 1 ].groups[ 0 ].items.map( mapButtonViewToMenuItem )
				)
			] )
		);
	} );

	it( 'should reuse custom empty menu instance if provided', () => {
		const { locale, menuRootList } = createBlankRootListView();
		const menuInstance = new DropdownMenuView( locale, 'Hello World' );

		menuRootList.definition.appendTopLevelMenu(
			{
				label: 'Menu Root',
				groups: [
					{
						items: [ menuInstance ]
					}
				]
			}
		);

		const tree = createTreeFromFlattenDropdownMenusList( menuRootList.definition.menus );

		expect( tree ).to.deep.equal(
			createRootTree( [
				mapMenuViewToMenuItemByLabel( 'Menu Root', tree, [
					mapMenuViewToMenuItem( menuInstance )
				] )
			] )
		);
	} );

	it( 'should reuse custom menu instance with custom entries if provided', () => {
		const { locale, menuRootList } = createBlankRootListView();

		const menuInstance = new DropdownMenuView( locale, 'Hello World' );
		const nestedEntries = [
			new DropdownMenuListItemButtonView( locale, 'Hello' ),
			new DropdownMenuListItemButtonView( locale, 'World' )
		];

		menuRootList.definition.appendTopLevelMenu(
			{
				label: 'Menu Root',
				groups: [
					{
						items: [ menuInstance ]
					}
				]
			}
		);

		menuRootList.definition.appendMenuItems(
			[
				{
					items: nestedEntries
				}
			],
			menuInstance
		);

		const tree = createTreeFromFlattenDropdownMenusList( menuRootList.definition.menus );

		expect( tree ).to.deep.equal(
			createRootTree( [
				mapMenuViewToMenuItemByLabel( 'Menu Root', tree, [
					mapMenuViewToMenuItem( menuInstance, nestedEntries.map( mapButtonViewToMenuItem ) )
				] )
			] )
		);
	} );
} );
