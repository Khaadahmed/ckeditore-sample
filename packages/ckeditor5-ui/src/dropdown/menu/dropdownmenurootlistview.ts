/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/dropdownmenurootlistview
 */

import type { Locale } from '@ckeditor/ckeditor5-utils';
import type { DropdownMenuChangeIsOpenEvent } from './events.js';
import type { DropdownMenuDefinitions } from './definition/dropdownmenudefinitiontypings.js';

import { DropdownRootMenuBehaviors } from './utils/dropdownmenubehaviors.js';
import DropdownMenuListView from './dropdownmenulistview.js';

import { DropdownMenuDefinitionController } from './definition/dropdownmenudefinitioncontroller.js';

/**
 * Represents the root list view of a dropdown menu.
 */
export default class DropdownMenuRootListView extends DropdownMenuListView {
	/**
	 * Indicates whether any of the top-level menus are open in the menu bar. To close
	 * the menu bar, use the `close` method.
	 *
	 * @observable
	 */
	declare public isOpen: boolean;

	/**
	 * Parses the provided menu definitions and stores their parsed structure in the form of a tree.
	 * The `DropdownMenuDefinitionController` object is responsible for parsing the menu definitions and creating a tree structure.
	 *
	 * @see DropdownMenuDefinitionController
	 */
	public readonly definition = new DropdownMenuDefinitionController( this );

	/**
	 * Creates an instance of the DropdownMenuRootListView class.
	 *
	 * @param locale - The locale object.
	 * @param definition The definition object for the dropdown menu root factory.
	 */
	constructor( locale: Locale, definitions?: DropdownMenuDefinitions ) {
		super( locale );

		this.set( 'isOpen', false );

		this._setupIsOpenUpdater();

		if ( definitions && definitions.length ) {
			this.definition.appendTopLevelMenus( definitions );
		}
	}

	/**
	 * Closes all menus in the dropdown menu bar.
	 */
	public close(): void {
		for ( const menuView of this.definition.menus ) {
			menuView.isOpen = false;
		}
	}

	/**
	 * Renders the dropdown menu.
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		DropdownRootMenuBehaviors.toggleMenusAndFocusItemsOnHover( this );
		DropdownRootMenuBehaviors.closeMenuWhenAnotherOnTheSameLevelOpens( this );
		DropdownRootMenuBehaviors.closeOnClickOutside( this );
		DropdownRootMenuBehaviors.closeWhenOutsideElementFocused( this );
	}

	/**
	 * Manages the state of the `isOpen` property of the dropdown menu bar. Because the state is a sum of individual
	 * top-level menus' states, it's necessary to listen to their changes and update the state accordingly.
	 *
	 * Additionally, it prevents unnecessary changes of `isOpen` when one top-level menu opens and another closes
	 * (regardless of the order), maintaining a stable `isOpen === true` in that situation.
	 */
	private _setupIsOpenUpdater() {
		let closeTimeout: ReturnType<typeof setTimeout>;

		this.on<DropdownMenuChangeIsOpenEvent>( 'menu:change:isOpen', ( evt, name, isOpen ) => {
			clearTimeout( closeTimeout );

			if ( isOpen ) {
				this.isOpen = true;
			} else {
				closeTimeout = setTimeout( () => {
					this.isOpen = this.definition.menus.some( ( { isOpen } ) => isOpen );
				}, 0 );
			}
		} );
	}
}
