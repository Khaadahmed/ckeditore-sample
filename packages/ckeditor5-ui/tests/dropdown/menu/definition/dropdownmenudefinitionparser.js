/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DropdownMenuRootListView from '../../../../src/dropdown/menu/dropdownmenurootlistview.js';
import { createMockLocale, createMockMenuDefinition } from '../_utils/dropdowntreemock.js';

describe( 'DropdownMenuDefinitionParser', () => {
	it( 'create proper tree for plain menu definition', () => {
		const definition = createMockMenuDefinition();
	} );

	function parseDefinition( definition ) {
		const menuRootList = new DropdownMenuRootListView( createMockLocale() );

		menuRootList.definition.appendMenu( definition );

		return menuRootList;
	}
} );
