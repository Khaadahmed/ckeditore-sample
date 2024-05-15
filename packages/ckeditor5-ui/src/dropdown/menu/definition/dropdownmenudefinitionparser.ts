/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/definition/dropdownmenudefinitionparser
 */

import type DropdownMenuRootListView from '../dropdownmenurootlistview.js';
import type { DropdownMenuOrFlatItemView } from '../typings.js';
import type {
	DropdownMenuDefinition,
	DropdownMenuDefinitions,
	DropdownMenuGroupDefinition
} from './dropdownmenudefinitiontypings.js';

import { DropdownMenuListItemView } from '../dropdownmenulistitemview.js';
import { isDropdownMenuDefinition } from './dropdownmenudefinitionguards.js';
import {
	createTreeFromFlattenDropdownMenusList,
	type DropdownMenuViewsRootTree
} from '../search/createtreefromflattendropdownmenuslist.js';

import DropdownMenuView from '../dropdownmenuview.js';
import ListSeparatorView from '../../../list/listseparatorview.js';
import {
	isDropdownMenuFocusableFlatItemView,
	isDropdownMenuListItemView,
	isDropdownMenuView
} from '../guards.js';

import {
	walkOverDropdownMenuTreeItems,
	type DropdownMenuViewsTreeWalkers
} from '../search/walkoverdropdownmenutreeitems.js';

/**
 * Represents a parser for the dropdown menu definition.
 * It stores the logical structure of the menu and does not handle its rendering.
 */
export class DropdownMenuDefinitionParser {
	/**
	 * Array of top-level menus in the dropdown menu.
	 */
	private _menus: Array<DropdownMenuView> = [];

	/**
	 * The root list view of the dropdown menu.
	 */
	private readonly _view: DropdownMenuRootListView;

	/**
	 * Creates an instance of DropdownMenuDefinitionParser.
	 *
	 * @param view The root list view of the dropdown menu.
	 */
	constructor( view: DropdownMenuRootListView ) {
		this._view = view;
	}

	/**
	 * Gets the array of top-level menus in the dropdown menu.
	 *
	 * @returns The array of top-level menus.
	 */
	public get menus(): Readonly<Array<DropdownMenuView>> {
		return [ ...this._menus ];
	}

	/**
	 * Gets the tree representation of the dropdown menu views.
	 *
	 * @returns The tree representation of the dropdown menu views.
	 */
	public get tree(): Readonly<DropdownMenuViewsRootTree> {
		return createTreeFromFlattenDropdownMenusList( this._menus );
	}

	/**
	 * Walks over the dropdown menu views using the specified walkers.
	 *
	 * @param walkers - The walkers to use.
	 */
	public walk( walkers: DropdownMenuViewsTreeWalkers ): void {
		walkOverDropdownMenuTreeItems( walkers, this.tree );
	}

	/**
	 * Appends multiple menus to the dropdown menu definition parser.
	 *
	 * @param items - An array of `DropdownMenuDefinition` objects representing the menus to be appended.
	 */
	public appendTopLevelMenus( items: DropdownMenuDefinitions ): void {
		items.forEach( this.appendTopLevelMenu.bind( this ) );
	}

	/**
	 * Appends a menu to the dropdown menu definition parser.
	 *
	 * @param menuDefinition - The menu definition to append.
	 */
	public appendTopLevelMenu( menuDefinition: DropdownMenuDefinition ): void {
		const topLevelMenuView = new DropdownMenuListItemView(
			this._view.locale!,
			null,
			this._registerMenuFromDefinition( menuDefinition )
		);

		this._view.items.add( topLevelMenuView );
	}

	/**
	 * Appends menu items to the target parent menu view.
	 *
	 * @param groups An array of dropdown menu group definitions.
	 * @param targetParentMenuView The target parent menu view to append the menu items to.
	 */
	public appendMenuItems(
		groups: Array<DropdownMenuGroupDefinition>,
		targetParentMenuView: DropdownMenuView
	): void {
		const { _view } = this;

		const locale = _view.locale!;
		const listItems = groups.flatMap( ( menuGroupDefinition, index ) => {
			const menuOrFlatItems = menuGroupDefinition.items.map( itemDefinition => {
				if ( isDropdownMenuDefinition( itemDefinition ) ) {
					return this._registerMenuFromDefinition( itemDefinition, targetParentMenuView );
				}

				return this._registerFlatItemOrMenuFromReusedInstance( itemDefinition, targetParentMenuView );
			} );

			return [
				// Append normal menu items.
				...menuOrFlatItems.map( menuOrFlatItem => new DropdownMenuListItemView(
					locale,
					targetParentMenuView,
					menuOrFlatItem
				) ),

				// Append separator between groups.
				...index !== groups.length - 1 ? [ new ListSeparatorView( locale ) ] : []
			];
		} );

		if ( listItems.length ) {
			targetParentMenuView.listView.items.addMany( listItems );
		}
	}

	/**
	 * Creates a menu view from the given menu definition.
	 *
	 * @param menuDefinition The dropdown menu definition.
	 * @param parentMenuView The parent menu view, if any.
	 * @returns The created menu view.
	 */
	private _registerMenuFromDefinition(
		menuDefinition: DropdownMenuDefinition,
		parentMenuView?: DropdownMenuView
	) {
		const { _view } = this;
		const locale = _view.locale!;

		const menuView = new DropdownMenuView( locale, menuDefinition.label );

		this.appendMenuItems( menuDefinition.groups, menuView );
		this._registerMenu( menuView, parentMenuView );

		return menuView;
	}

	/**
	 * Registers a menu tree from the given component view definition.
	 *
	 * @param menuOrFlatItemView The component view definition.
	 * @param parentMenuView The parent menu view.
	 * @returns The registered component view.
	 */
	private _registerFlatItemOrMenuFromReusedInstance(
		menuOrFlatItemView: DropdownMenuOrFlatItemView,
		parentMenuView: DropdownMenuView
	) {
		if ( isDropdownMenuFocusableFlatItemView( menuOrFlatItemView ) ) {
			menuOrFlatItemView.delegate( 'mouseenter' ).to( parentMenuView );

			return menuOrFlatItemView;
		}

		this._registerMenu( menuOrFlatItemView, parentMenuView );

		menuOrFlatItemView.nestedMenuListItems.forEach( menuListItem => {
			if ( isDropdownMenuListItemView( menuListItem ) && isDropdownMenuView( menuListItem.flatItemOrNestedMenuView ) ) {
				this._registerFlatItemOrMenuFromReusedInstance(
					menuListItem.flatItemOrNestedMenuView,
					menuOrFlatItemView
				);
			}
		} );

		return menuOrFlatItemView;
	}

	/**
	 * Registers a menu in the dropdown menu.
	 *
	 * @param menuView The menu view to register.
	 * @param parentMenuView The parent menu view, if any.
	 */
	private _registerMenu( menuView: DropdownMenuView, parentMenuView: DropdownMenuView | null = null ): void {
		const delegatedEvents = [ 'mouseenter', 'arrowleft', 'arrowright', 'change:isOpen' ] as const;

		if ( parentMenuView ) {
			menuView.delegate( ...delegatedEvents ).to( parentMenuView );
			menuView.parentMenuView = parentMenuView;
		} else {
			menuView.delegate( ...delegatedEvents ).to( this._view, name => `menu:${ name }` );
		}

		menuView._attachBehaviors();
		menuView.on( 'execute', () => {
			// Close the whole menu bar when a component is executed.
			this._view.close();
		} );

		this._menus.push( menuView );
	}
}
