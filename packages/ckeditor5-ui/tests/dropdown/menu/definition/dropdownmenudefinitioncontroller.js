/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { DropdownMenuDefinitionController } from '../../../../src/dropdown/menu/definition/dropdownmenudefinitioncontroller.js';
import DropdownMenuRootListView from '../../../../src/dropdown/menu/dropdownmenurootlistview.js';
import DropdownMenuListItemButtonView from '../../../../src/dropdown/menu/dropdownmenulistitembuttonview.js';

import { createMockLocale, createMockMenuDefinition } from '../_utils/dropdowntreemock.js';
import {
	createRootTree,
	findMenuTreeViewItemByLabel,
	mapButtonViewToFlatMenuItem,
	mapButtonViewToFlatMenuItemByLabel,
	mapMenuViewToMenuItemByLabel
} from '../_utils/dropdowntreeutils.js';

describe( 'DropdownMenuDefinitionController', () => {
	let locale;

	beforeEach( () => {
		locale = createMockLocale();
	} );

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

		it( 'should properly handle three level depth menu definition', () => {
			const mockDefinition = {
				label: 'Menu',
				groups: [
					{
						items: [
							new DropdownMenuListItemButtonView( locale, 'Foo' ),
							{
								label: 'Nested menu',
								groups: [
									{
										items: [
											new DropdownMenuListItemButtonView( locale, 'Bar' )
										]
									}
								]
							}
						]
					}
				]
			};

			const { definition } = parseDefinition( mockDefinition );
			const { tree } = definition;

			expect( tree ).to.be.deep.equal(
				createRootTree( [
					mapMenuViewToMenuItemByLabel(
						'Menu', tree,
						[
							mapButtonViewToFlatMenuItemByLabel( 'Foo', tree ),
							mapMenuViewToMenuItemByLabel( 'Nested menu', tree, [
								mapButtonViewToFlatMenuItemByLabel( 'Bar', tree )
							] )
						]
					)
				] )
			);
		} );
	} );

	describe( 'walk()', () => {
		it( 'should properly walk through the tree', () => {
			const { definition } = parseDefinition( [
				createMockMenuDefinition( 'Menu 1' ),
				createMockMenuDefinition( 'Menu 2' )
			] );

			const tracking = {
				entered: [],
				left: []
			};

			const trackedWalkers = {
				enter: ( { node } ) => {
					tracking.entered.push( node.search.raw );
				},
				leave: ( { node } ) => {
					tracking.left.unshift( node.search.raw );
				}
			};

			definition.walk(
				{
					Item: trackedWalkers,
					Menu: trackedWalkers
				}
			);

			expect( tracking.entered ).to.be.deep.equal( [
				'Menu 1', 'Foo', 'Bar', 'Buz', 'Menu 2', 'Foo', 'Bar', 'Buz'
			] );

			expect( tracking.left ).to.be.deep.equal( [
				'Menu 2', 'Buz', 'Bar', 'Foo', 'Menu 1', 'Buz', 'Bar', 'Foo'
			] );
		} );
	} );

	describe( 'menus', () => {
		it( 'should be empty after initialization', () => {
			const instance = new DropdownMenuDefinitionController(
				new DropdownMenuRootListView( createMockLocale() )
			);

			expect( instance.menus ).to.be.empty;
		} );

		it( 'should return flatten list of menus (excluding flat items)', () => {
			const mockDefinitions = [
				createMockMenuDefinition( 'Menu 1' ),
				createMockMenuDefinition( 'Menu 2' )
			];

			const { definition } = parseDefinition( mockDefinitions );
			const { tree, menus } = definition;

			expect( menus ).to.be.deep.equal(
				[
					findMenuTreeViewItemByLabel( 'Menu 1', tree ),
					findMenuTreeViewItemByLabel( 'Menu 2', tree )
				]
			);
		} );
	} );

	describe( 'locale', () => {
		it( 'should return locale instance', () => {
			const mockDefinition = createMockMenuDefinition();
			const { definition, locale } = parseDefinition( mockDefinition );

			expect( definition.locale ).to.be.equal( locale );
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
