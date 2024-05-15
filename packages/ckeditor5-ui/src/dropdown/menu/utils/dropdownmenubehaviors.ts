/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/utils/dropdownmenubehaviors
 */

import type DropdownMenuView from '../dropdownmenuview.js';
import type { ObservableChangeEvent } from '@ckeditor/ckeditor5-utils';
import type {
	DropdownMenuMouseEnterEvent,
	DropdownMenuChangeIsOpenEvent
} from '../events.js';

import type { ButtonExecuteEvent } from '../../../button/button.js';
import type DropdownMenuRootListView from '../dropdownmenurootlistview.js';

import DropdownMenuListItemView from '../dropdownmenulistitemview.js';
import clickOutsideHandler from '../../../bindings/clickoutsidehandler.js';

export const DropdownRootMenuBehaviors = {
	/**
	 * Closes the menu when an element outside the menu is focused.
	 */
	closeWhenOutsideElementFocused( menuBarView: DropdownMenuRootListView ): void {
		menuBarView.listenTo( document, 'focus', () => {
			if ( menuBarView.element && !menuBarView.element.contains( document.activeElement ) ) {
				menuBarView.close();
			}
		}, { useCapture: true } );
	},

	/**
	 * When the bar is already open:
	 * * Opens the menu when the user hovers over its button.
	 * * Closes open menu when another menu's button gets hovered.
	 */
	toggleMenusAndFocusItemsOnHover( menuBarView: DropdownMenuRootListView ): void {
		menuBarView.on<DropdownMenuMouseEnterEvent>( 'menu:mouseenter', evt => {
			for ( const menuView of menuBarView.definition.menus ) {
				// @if CK_DEBUG_MENU_BAR // const wasOpen = menuView.isOpen;

				const pathLeaf = evt.path[ 0 ];
				const isListItemContainingMenu = pathLeaf instanceof DropdownMenuListItemView && pathLeaf.children.first === menuView;

				menuView.isOpen = ( evt.path.includes( menuView ) || isListItemContainingMenu ) && menuView.isEnabled;
			}
		} );
	},

	/**
	 * Handles the following case:
	 * 1. Hover to open a sub-menu (A). The button has focus.
	 * 2. Press arrow up/down to move focus to another sub-menu (B) button.
	 * 3. Press arrow right to open the sub-menu (B).
	 * 4. The sub-menu (A) should close as it would with `toggleMenusAndFocusItemsOnHover()`.
	 */
	closeMenuWhenAnotherOnTheSameLevelOpens( menuBarView: DropdownMenuRootListView ): void {
		menuBarView.on<DropdownMenuChangeIsOpenEvent>( 'menu:change:isOpen', ( evt, name, isOpen ) => {
			if ( !isOpen ) {
				return;
			}

			menuBarView
				.definition
				.menus
				.filter( menuView => {
					return ( evt.source as any ).parentMenuView === menuView.parentMenuView &&
						evt.source !== menuView &&
						menuView.isOpen;
				} )
				.forEach( ( menuView: any ) => {
					menuView.isOpen = false;
				} );
		} );
	},

	/**
	 * Closes the bar when the user clicked outside of it (page body, editor root, etc.).
	 */
	closeOnClickOutside( menuBarView: DropdownMenuRootListView ): void {
		clickOutsideHandler( {
			emitter: menuBarView,
			activator: () => menuBarView.isOpen,
			callback: () => menuBarView.close(),
			contextElements: () => menuBarView.definition.menus.map( child => child.element! ),
			options: {
				priority: 'high'
			}
		} );
	}
};

export const DropdownMenuBehaviors = {
	/**
	 * Open the menu on the right arrow key press. This allows for navigating to sub-menus using the keyboard.
	 */
	openOnArrowRightKey( menuView: DropdownMenuView ): void {
		const keystroke = menuView.locale!.uiLanguageDirection === 'rtl' ? 'arrowleft' : 'arrowright';

		menuView.keystrokes.set( keystroke, ( data, cancel ) => {
			if ( menuView.focusTracker.focusedElement !== menuView.buttonView.element || !menuView.isEnabled ) {
				return;
			}

			if ( !menuView.isOpen ) {
				menuView.isOpen = true;
			}

			menuView.panelView.focus();
			cancel();
		} );
	},

	/**
	 * Opens the menu on its button click. Note that this behavior only opens but never closes the menu (unlike
	 * {@link module:ui/dropdown/dropdownview~DropdownView}).
	 */
	openOnButtonClick( menuView: DropdownMenuView ): void {
		menuView.buttonView.on<ButtonExecuteEvent>( 'execute', () => {
			menuView.isOpen = true;
			menuView.panelView.focus();
		} );
	},

	/**
	 * Toggles the menu on its button click. This behavior is analogous to {@link module:ui/dropdown/dropdownview~DropdownView}.
	 */
	toggleOnButtonClick( menuView: DropdownMenuView ): void {
		menuView.buttonView.on<ButtonExecuteEvent>( 'execute', () => {
			menuView.isOpen = !menuView.isOpen;

			if ( menuView.isOpen ) {
				menuView.panelView.focus();
			}
		} );
	},

	/**
	 * Closes the menu on the right left key press. This allows for navigating to sub-menus using the keyboard.
	 */
	closeOnArrowLeftKey( menuView: DropdownMenuView ): void {
		const keystroke = menuView.locale!.uiLanguageDirection === 'rtl' ? 'arrowright' : 'arrowleft';

		menuView.keystrokes.set( keystroke, ( data, cancel ) => {
			if ( menuView.isOpen ) {
				menuView.isOpen = false;
				menuView.focus();
				cancel();
			}
		} );
	},

	/**
	 * Closes the menu on the esc key press. This allows for navigating to sub-menus using the keyboard.
	 */
	closeOnEscKey( menuView: DropdownMenuView ): void {
		menuView.keystrokes.set( 'esc', ( data, cancel ) => {
			if ( menuView.isOpen ) {
				menuView.isOpen = false;
				menuView.focus();
				cancel();
			}
		} );
	},

	/**
	 * Closes the menu when its parent menu also closed. This prevents from orphaned open menus when the parent menu re-opens.
	 */
	closeOnParentClose( menuView: DropdownMenuView ): void {
		if ( menuView.parentMenuView ) {
			menuView.parentMenuView!.on<ObservableChangeEvent<boolean>>( 'change:isOpen', ( evt, name, isOpen ) => {
				if ( !isOpen && evt.source === menuView.parentMenuView ) {
					menuView.isOpen = false;
				}
			} );
		}
	}
};
