/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { createTreeFromFlattenDropdownMenusList } from '../../../../src/dropdown/menu/search/createtreefromflattendropdownmenuslist.js';
import { filterDropdownMenuTreeByRegExp } from '../../../../src/dropdown/menu/search/filterdropdownmenutreebyregexp.js';
import {
	getTotalDropdownMenuTreeFlatItemsCount
} from '../../../../src/dropdown/menu/search/gettotaldropdownmenutreeflatitemscount.js';

import { createMockDropdownMenuDefinition } from '../_utils/dropdowntreemock.js';
import {
	createRootTree,
	mapButtonViewToMenuItem,
	mapMenuViewToMenuItemByLabel,
	markAsFound
} from '../_utils/dropdowntreeutils.js';

describe( 'filterDropdownMenuTreeByRegExp', () => {
	it( 'should return 0 found items on empty tree', () => {
		const result = filterDropdownMenuTreeByRegExp( /[.*]/g, createRootTree() );

		expect( result ).to.deep.equal( {
			resultsCount: 0,
			totalItemsCount: 0,
			filteredTree: createRootTree()
		} );
	} );

	it( 'should return all menu children if menu label matches', () => {
		const { menuRootList, menusDefinitions } = createMockDropdownMenuDefinition();

		const tree = createTreeFromFlattenDropdownMenusList( menuRootList.definition.menus );
		const { resultsCount, filteredTree, totalItemsCount } = filterDropdownMenuTreeByRegExp(
			/Menu 1/ig,
			tree
		);

		expect( resultsCount ).to.be.equal( 3 );
		expect( totalItemsCount ).to.be.equal( 5 );
		expect( filteredTree ).to.deep.equal(
			createRootTree( [
				markAsFound(
					mapMenuViewToMenuItemByLabel(
						'Menu 1',
						tree,
						[
							...menusDefinitions[ 0 ].groups[ 0 ].items,
							...menusDefinitions[ 0 ].groups[ 1 ].items
						]
							.map( mapButtonViewToMenuItem )
					)
				)
			] )
		);
	} );

	it( 'should return all child items if regexp is null', () => {
		const { menuRootList, menusDefinitions } = createMockDropdownMenuDefinition();

		const tree = createTreeFromFlattenDropdownMenusList( menuRootList.definition.menus );
		const { resultsCount, filteredTree, totalItemsCount } = filterDropdownMenuTreeByRegExp( null, tree );

		expect( resultsCount ).to.be.equal( 5 );
		expect( totalItemsCount ).to.be.equal( 5 );
		expect( filteredTree ).to.deep.equal(
			createRootTree( [
				markAsFound(
					mapMenuViewToMenuItemByLabel(
						'Menu 1', tree,
						[
							...menusDefinitions[ 0 ].groups[ 0 ].items,
							...menusDefinitions[ 0 ].groups[ 1 ].items
						]
							.map( mapButtonViewToMenuItem )
					)
				),

				markAsFound(
					mapMenuViewToMenuItemByLabel(
						'Menu 2', tree,
						menusDefinitions[ 1 ].groups[ 0 ].items.map( mapButtonViewToMenuItem )
					)
				)
			] )
		);
	} );

	it( 'should return child if label matches', () => {
		const { menuRootList, menusDefinitions } = createMockDropdownMenuDefinition();

		const tree = createTreeFromFlattenDropdownMenusList( menuRootList.definition.menus );
		const { resultsCount, filteredTree, totalItemsCount } = filterDropdownMenuTreeByRegExp(
			/Foo/ig,
			tree
		);

		expect( resultsCount ).to.be.equal( 1 );
		expect( totalItemsCount ).to.be.equal( 5 );
		expect( filteredTree ).to.deep.equal(
			createRootTree( [
				mapMenuViewToMenuItemByLabel(
					'Menu 1',
					tree,
					[
						mapButtonViewToMenuItem( menusDefinitions[ 0 ].groups[ 0 ].items[ 0 ] )
					].map( markAsFound )
				)
			] )
		);
	} );

	it( 'should not modify passed tree object', () => {
		const { menuRootList } = createMockDropdownMenuDefinition();

		const tree = Object.freeze( createTreeFromFlattenDropdownMenusList( menuRootList.definition.menus ) );
		const { filteredTree } = filterDropdownMenuTreeByRegExp(
			/Foo/gi,
			tree
		);

		expect( filteredTree ).not.to.be.equal( tree );
		expect( getTotalDropdownMenuTreeFlatItemsCount( filteredTree ) ).not.to.be.equal(
			getTotalDropdownMenuTreeFlatItemsCount( tree )
		);
	} );
} );
