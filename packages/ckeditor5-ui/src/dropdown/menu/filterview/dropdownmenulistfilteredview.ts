/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/filterview/dropdownmenulistfilteredview
 */

import type { Locale } from '@ckeditor/ckeditor5-utils';
import type { DropdownMenuDefinitions } from '../definition/dropdownmenudefinitiontypings.js';
import type FilteredView from '../../../search/filteredview.js';

import { filterDropdownMenuTreeByRegExp } from '../search/filterdropdownmenutreebyregexp.js';

import View from '../../../view.js';
import DropdownMenuListFoundListView from './dropdownmenulistfoundlistview.js';
import DropdownMenuRootListView from '../dropdownmenurootlistview.js';

/**
 * Represents a filtered view for a dropdown menu list.
 * This class extends the `View` class and implements the `FilteredView` interface.
 */
export default class DropdownMenuListFilteredView extends View implements FilteredView {
	/**
	 * The root list view of the dropdown menu.
	 */
	protected _menuView: DropdownMenuRootListView;

	/**
	 * The found list view of the dropdown menu.
	 */
	protected _foundListView: DropdownMenuListFoundListView | null = null;

	/**
	 * Represents a filtered view for the dropdown menu list.
	 */
	constructor( locale: Locale, definitions: DropdownMenuDefinitions ) {
		super( locale );

		this._menuView = new DropdownMenuRootListView( locale, definitions );
		this.setTemplate( {
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-dropdown-menu-filter'
				],
				tabindex: -1
			},

			children: [
				this._menuView
			]
		} );
	}

	/**
	 * Filters the dropdown menu list based on the provided regular expression.
	 *
	 * @param regExp The regular expression to filter the list.
	 * @returns An object containing the number of filtered results and the total number of items in the list.
	 */
	public filter( regExp: RegExp | null ): { resultsCount: number; totalItemsCount: number } {
		const { element } = this;
		const { filteredTree, resultsCount, totalItemsCount } = filterDropdownMenuTreeByRegExp(
			regExp,
			this._menuView.definition.tree
		);

		element!.innerHTML = '';

		if ( this._foundListView ) {
			this._foundListView.destroy();
			this._foundListView = null;
		}

		if ( resultsCount !== totalItemsCount ) {
			this._foundListView = new DropdownMenuListFoundListView( this.locale!, regExp, filteredTree );
			this._foundListView.render();

			element!.appendChild( this._foundListView.element! );
		} else {
			element!.appendChild( this._menuView.element! );
		}

		return {
			resultsCount,
			totalItemsCount
		};
	}

	/**
	 * Sets the focus on the dropdown menu list.
	 */
	public focus(): void {
		const { _menuView, _foundListView } = this;

		if ( _foundListView ) {
			_foundListView.focus();
		} else {
			_menuView.focus();
		}
	}
}
