/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { DropdownMenuDefinitionController } from '../../../../src/dropdown/menu/definition/dropdownmenudefinitioncontroller.js';
import DropdownMenuRootListView from '../../../../src/dropdown/menu/dropdownmenurootlistview.js';
import DropdownMenuListItemButtonView from '../../../../src/dropdown/menu/dropdownmenulistitembuttonview.js';
import DropdownMenuView from '../../../../src/dropdown/menu/dropdownmenuview.js';
import { DropdownMenuListItemView } from '../../../../src/dropdown/menu/dropdownmenulistitemview.js';

import { createBlankRootListView, createMockLocale, createMockMenuDefinition } from '../_utils/dropdowntreemock.js';
import {
	createRootTree,
	findMenuTreeMenuViewByLabel,
	findMenuTreeNodeByLabel,
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

	describe( 'events', () => {
		const delegatedEvents = [ 'mouseenter', 'arrowleft', 'arrowright', 'change:isOpen' ];

		for ( const event of delegatedEvents ) {
			it( `should delegate ${ event } event to root menu view`, () => {
				const { locale, menuRootList } = createBlankRootListView();
				const menuInstance = new DropdownMenuView( locale, 'Hello World' );
				const eventWatcherSpy = sinon.spy();

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

				menuRootList.on( `menu:${ event }`, eventWatcherSpy );
				menuInstance.fire( event );

				expect( eventWatcherSpy ).to.be.calledOnce;
			} );
		}
	} );

	describe( '`tree` getter', () => {
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

	describe( '`menus` getter', () => {
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
					findMenuTreeMenuViewByLabel( 'Menu 1', tree ),
					findMenuTreeMenuViewByLabel( 'Menu 2', tree )
				]
			);
		} );
	} );

	describe( '`locale` getter', () => {
		it( 'should return locale instance', () => {
			const mockDefinition = createMockMenuDefinition();
			const { definition, locale } = parseDefinition( mockDefinition );

			expect( definition.locale ).to.be.equal( locale );
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

	describe( 'closeAll()', () => {
		it( 'should close all menus', () => {
			const mockDefinition = createMockMenuDefinition();
			const { definition } = parseDefinition( mockDefinition );

			definition.closeAll();

			expect( definition.tree.children.some( menu => menu.isOpen ) ).to.be.false;
		} );
	} );

	describe( 'appendTopLevelMenus()', () => {
		it( 'should not crash if called with empty array', () => {
			expect( () => {
				const { definition } = parseDefinition( [] );

				definition.appendTopLevelMenus( [] );
			} ).not.to.throw();
		} );

		it( 'should append top level menus', () => {
			const { definition } = parseDefinition( [] );

			definition.appendTopLevelMenus( [
				createMockMenuDefinition( 'Menu 1' ),
				createMockMenuDefinition( 'Menu 2' )
			] );

			definition.appendTopLevelMenus( [
				createMockMenuDefinition( 'Menu 3' )
			] );

			expect( definition.tree.children.map( menu => menu.search.raw ) ).to.be.deep.equal(
				[ 'Menu 1', 'Menu 2', 'Menu 3' ]
			);
		} );
	} );

	describe( 'appendTopLevelMenu()', () => {
		it( 'should append top level menu', () => {
			const { definition } = parseDefinition( [] );

			definition.appendTopLevelMenu( createMockMenuDefinition( 'Menu 1' ) );
			definition.appendTopLevelMenu( createMockMenuDefinition( 'Menu 2' ) );

			expect( definition.tree.children.map( menu => menu.search.raw ) ).to.be.deep.equal(
				[ 'Menu 1', 'Menu 2' ]
			);
		} );
	} );

	describe( 'appendMenuItems()', () => {
		it( 'should append flat menu items to the menu', () => {
			const { definition } = parseDefinition(
				{
					label: 'Hello World',
					groups: []
				}
			);

			definition.appendMenuItems(
				[
					{
						items: [
							new DropdownMenuListItemButtonView( locale, 'Baz' )
						]
					}
				],
				findMenuTreeMenuViewByLabel( 'Hello World', definition.tree )
			);

			const insertedChild = findMenuTreeNodeByLabel( 'Baz', definition.tree.children[ 0 ] );

			expect( insertedChild.search.raw ).to.be.equal( 'Baz' );
		} );

		it( 'should reuse menu view instance on insert', () => {
			const { definition } = parseDefinition(
				{
					label: 'Hello World',
					groups: []
				}
			);

			const menuInstance = new DropdownMenuView( locale, 'Baz' );

			menuInstance.listView.items.add(
				new DropdownMenuListItemView(
					locale,
					menuInstance,
					new DropdownMenuView( locale, 'Nested Menu Menu' )
				)
			);

			definition.appendMenuItems(
				[
					{
						items: [
							menuInstance
						]
					}
				],
				findMenuTreeMenuViewByLabel( 'Hello World', definition.tree )
			);

			const insertedChild = findMenuTreeNodeByLabel( 'Nested Menu Menu', definition.tree );

			expect( insertedChild.search.raw ).to.be.equal( 'Nested Menu Menu' );
		} );
	} );

	function parseDefinition( definition ) {
		return new DropdownMenuRootListView(
			createMockLocale(),
			Array.isArray( definition ) ? definition : [ definition ]
		);
	}
} );
