/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DropdownMenuListItemButtonView from '../../../../src/dropdown/menu/dropdownmenulistitembuttonview.js';
import DropdownMenuRootListView from '../../../../src/dropdown/menu/dropdownmenurootlistview.js';

export function createBlankRootListView() {
	const locale = { t() {} };

	return {
		locale,
		menuRootList: new DropdownMenuRootListView( locale )
	};
}

export function createMockDropdownMenuDefinition() {
	const { locale, menuRootList } = createBlankRootListView();

	const menusDefinitions = [
		{
			label: 'Menu 1',
			groups: [
				{
					items: [
						new DropdownMenuListItemButtonView( locale, 'Foo' ),
						new DropdownMenuListItemButtonView( locale, 'Bar' )
					]
				},
				{
					items: [
						new DropdownMenuListItemButtonView( locale, 'Buz' )
					]
				}
			]
		},
		{
			label: 'Menu 2',
			groups: [
				{
					items: [
						new DropdownMenuListItemButtonView( locale, 'A' ),
						new DropdownMenuListItemButtonView( locale, 'B' )
					]
				}
			]
		}
	];

	menuRootList.definition.appendMenus( {
		items: menusDefinitions
	} );

	return {
		locale,
		menuRootList,
		menusDefinitions
	};
}
