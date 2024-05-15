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
	DropdownMenuGroupDefinition,
	DropdownMenuRootFactoryDefinition
} from './dropdownmenudefinitiontypings.js';

import { DropdownMenuListItemView } from '../dropdownmenulistitemview.js';
import { isDropdownMenuDefinition } from './dropdownmenudefinitionguards.js';

import DropdownMenuView from '../dropdownmenuview.js';
import ListSeparatorView from '../../../list/listseparatorview.js';
import {
	isDropdownMenuFocusableFlatItemView,
	isDropdownMenuListItemView,
	isDropdownMenuView
} from '../guards.js';

/**
 * Parser for dropdown menu definitions.
 */
export class DropdownMenuDefinitionParser {
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
	 * Appends menus to the dropdown menu root view based on the provided definition.
	 *
	 * @param definition The dropdown menu factory definition.
	 */
	public appendMenus( { items }: DropdownMenuRootFactoryDefinition ): void {
		const topLevelMenuViews = items.map( menuDefinition => new DropdownMenuListItemView(
			this._view.locale!,
			null,
			this._registerMenuFromDefinition( menuDefinition )
		) );

		this._view.items.addMany( topLevelMenuViews );
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
		const items = groups.flatMap( ( menuGroupDefinition, index ) => {
			const menuItems = menuGroupDefinition.items.map( itemDefinition => {
				if ( isDropdownMenuDefinition( itemDefinition ) ) {
					return new DropdownMenuListItemView(
						locale,
						targetParentMenuView,
						this._registerMenuFromDefinition( itemDefinition, targetParentMenuView )
					);
				}

				return new DropdownMenuListItemView(
					locale,
					targetParentMenuView,
					this._registerFromReusedInstance( itemDefinition, targetParentMenuView )
				);
			} );

			const maybeSeparator = index !== groups.length - 1 ? [ new ListSeparatorView( locale ) ] : [];

			return [ ...menuItems, ...maybeSeparator ];
		} );

		if ( items.length ) {
			targetParentMenuView.listView.items.addMany( items );
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
		_view.registerMenu( menuView, parentMenuView );

		return menuView;
	}

	/**
	 * Registers a menu tree from the given component view definition.
	 *
	 * @param menuOrFlatItemView The component view definition.
	 * @param parentMenuView The parent menu view.
	 * @returns The registered component view.
	 */
	private _registerFromReusedInstance(
		menuOrFlatItemView: DropdownMenuOrFlatItemView,
		parentMenuView: DropdownMenuView
	) {
		const { _view } = this;

		if ( isDropdownMenuFocusableFlatItemView( menuOrFlatItemView ) ) {
			menuOrFlatItemView.delegate( 'mouseenter' ).to( parentMenuView );

			return menuOrFlatItemView;
		}

		_view.registerMenu( menuOrFlatItemView, parentMenuView );

		menuOrFlatItemView.nestedMenuListItems.forEach( menuListItem => {
			if ( isDropdownMenuListItemView( menuListItem ) && isDropdownMenuView( menuListItem.flatItemOrNestedMenuView ) ) {
				this._registerFromReusedInstance(
					menuListItem.flatItemOrNestedMenuView,
					menuOrFlatItemView
				);
			}
		} );

		return menuOrFlatItemView;
	}
}
