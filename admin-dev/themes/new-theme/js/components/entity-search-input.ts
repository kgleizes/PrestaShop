/**
 * Copyright since 2007 PrestaShop SA and Contributors
 * PrestaShop is an International Registered Trademark & Property of PrestaShop SA
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is bundled with this package in the file LICENSE.md.
 * It is also available through the world-wide-web at this URL:
 * https://opensource.org/licenses/OSL-3.0
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@prestashop.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade PrestaShop to newer
 * versions in the future. If you wish to customize PrestaShop for your
 * needs please refer to https://devdocs.prestashop.com/ for more information.
 *
 * @author    PrestaShop SA and Contributors <contact@prestashop.com>
 * @copyright Since 2007 PrestaShop SA and Contributors
 * @license   https://opensource.org/licenses/OSL-3.0 Open Software License (OSL 3.0)
 */

import AutoCompleteSearch from '@components/auto-complete-search';
import EntitySearchInputMap from '@components/./entity-search-input-map';
import ConfirmModal from '@components/modal';
import Bloodhound from 'typeahead.js';

/**
 * This component is used to search and select one or several entities, it uses the AutoSearchComplete
 * component which displays a list of suggestion based on an API returned response. Then when
 * an element is selected it is added to the selection container and hidden inputs are created to
 * send an array of entity IDs in the form request.
 *
 * This component is used with EntitySearchInputType forms, and is tightly linked to the content of this
 * twig file src/PrestaShopBundle/Resources/views/Admin/TwigTemplateForm/entity_search_input.html.twig
 *
 * The default content of the collection is an EntityItemType with a simple default template but you can
 * either override it in a theme or create your own entity type if you need to customize the behaviour.
 */
export default class EntitySearchInput {
  $entitySearchInputContainer: JQuery;

  $entitySearchInput: JQuery;

  $selectionContainer: JQuery;

  options: OptionsObject;

  entityRemoteSource: any;

  autoSearch: any;

  constructor($entitySearchInputContainer: JQuery, options: OptionsObject) {
    this.options = {};
    this.$entitySearchInputContainer = $entitySearchInputContainer;
    this.buildOptions(options);

    this.$entitySearchInput = $(this.options.searchInputSelector, this.$entitySearchInputContainer);
    this.$selectionContainer = $(this.options.listSelector, this.$entitySearchInputContainer);

    this.buildRemoteSource();
    this.buildAutoCompleteSearch();
    this.buildActions();

    return {
      setValues: (values) => this.setValues(values),
      getOption: (optionName) => this.options[optionName],
      setOption: (optionName, value) => this.setOption(optionName, value),
    };
  }

  /**
   * Force selected values, the input is an array of object that must match the format from
   * the API if you want the selected entities to be correctly displayed.
   *
   * @param values {array}
   */
  setValues(values: array): void {
    this.clearSelectedItems();
    if (!values || values.length <= 0) {
      return;
    }

    values.each((index: number, value: any) => {
      this.appendSelectedItem(value);
    });
  }

  /**
   * @param {string} optionName
   * @param {*} value
   */
  setOption(optionName: string, value: any) {
    this.options[optionName] = value;

    // Apply special options to components when needed
    if (optionName === 'remoteUrl') {
      this.entityRemoteSource.remote.url = this.options.remoteUrl;
    }
  }

  /**
   * @param {Object} options
   */
  buildOptions(options: OptionsObject) {
    const inputOptions = options || {};
    const defaultOptions: OptionsObject = {
      mappingValue: 'id',
      mappingDisplay: 'name',
      mappingImage: 'image',

      prototypeTemplate: undefined,
      prototypeName: '__name__',
      prototypeImage: '__image__',
      prototypeValue: '__value__',
      prototypeDisplay: '__display__',

      allowDelete: true,
      dataLimit: 0,
      remoteUrl: undefined,

      removeModalTitle: undefined,
      removeModalMessage: undefined,
      removeModalApply: undefined,
      removeModalCancel: undefined,

      // Most of the previous config are configurable via the EntitySearchInputForm options, the following ones are only
      // overridable via js config (as long as you use the default template)
      searchInputSelector: EntitySearchInputMap.searchInputSelector,
      listSelector: EntitySearchInputMap.listSelector,
      entityItemSelector: EntitySearchInputMap.entityItemSelector,
      entityDeleteSelector: EntitySearchInputMap.entityDeleteSelector,
      removeModalId: 'modal-confirm-remove-entity',
      confirmButtonClass: 'btn-danger',
      queryWildcard: '__QUERY__',

      // These are configurable callbacks
      onRemovedContent: undefined,
      onSelectedContent: undefined,
    };

    Object.keys(defaultOptions).forEach((optionName) => {
      // This gets the proper value for each option, respecting the priority: input > data-attribute > default
      this.initOption(optionName, inputOptions, defaultOptions[optionName]);
    });
  }

  /**
   * Init the option value, the input config has the more priority. It overrides the data attribute option
   * (if present), finally a default value is used (if defined).
   *
   * @param {string} optionName
   * @param {Object} inputOptions
   * @param {*|undefined} defaultOption
   */
  initOption(optionName: string, inputOptions: OptionsObject, defaultOption: any = undefined) {
    if (Object.prototype.hasOwnProperty.call(inputOptions, optionName)) {
      this.options[optionName] = inputOptions[optionName];
    } else if (typeof this.$entitySearchInputContainer.data(optionName) !== 'undefined') {
      this.options[optionName] = this.$entitySearchInputContainer.data(optionName);
    } else {
      this.options[optionName] = defaultOption;
    }
  }

  buildActions() {
    // Always check for click even if it is useless when allowDelete options is false, it can be changed dynamically
    $(this.$selectionContainer).on('click', this.options.entityDeleteSelector, (event) => {
      if (!this.options.allowDelete) {
        return;
      }

      const $entity = $(event.target).closest(this.options.entityItemSelector);
      const modal = new ConfirmModal(
        {
          id: this.options.removeModalId,
          confirmTitle: this.options.removeModalTitle,
          confirmMessage: this.options.removeModalMessage,
          confirmButtonLabel: this.options.removeModalApply,
          closeButtonLabel: this.options.removeModalCancel,
          confirmButtonClass: this.options.confirmButtonClass,
          closable: true,
        },
        () => {
          const $hiddenInput = $('input[type="hidden"]', $entity);
          $entity.remove();
          $hiddenInput.trigger('change');
          this.$selectionContainer.trigger('change');

          if (typeof this.options.onRemovedContent !== 'undefined') {
            this.options.onRemovedContent($entity);
          }
        },
      );
      modal.show();
    });

    // For now adapt the display based on the allowDelete option
    const $entityDelete = $(this.options.entityDeleteSelector, this.$selectionContainer);
    $entityDelete.toggle(!!this.options.allowDelete);
  }

  /**
   * Build the AutoCompleteSearch component
   */
  buildAutoCompleteSearch(): void {
    const autoSearchConfig = {
      source: this.entityRemoteSource,
      dataLimit: this.options.dataLimit,
      value: '',
      templates: {
        suggestion: (entity: any) => {
          let entityImage;

          if (Object.prototype.hasOwnProperty.call(entity, 'image')) {
            entityImage = `<img src="${entity.image}" /> `;
          }

          return `<div class="search-suggestion">${entityImage}${entity.name}</div>`;
        },
      },
      /* eslint-disable-next-line no-unused-vars */
      onSelect: (selectedItem: any, event: JQueryEventObject) => {
        // When limit is one we cannot select additional elements so we replace them instead
        if (this.options.dataLimit === 1) {
          return this.replaceSelectedItem(selectedItem);
        }
        return this.appendSelectedItem(selectedItem);
      },
    };

    // Can be used to format value depending on selected item
    if (this.options.mappingValue !== undefined) {
      autoSearchConfig.value = <string> this.options.mappingValue;
    }
    this.autoSearch = new AutoCompleteSearch(
      this.$entitySearchInput,
      autoSearchConfig,
    );
  }

  /**
   * Build the Bloodhound remote source which will call the API. The placeholder to
   * inject the query search parameter is __QUERY__
   *
   * @returns {Bloodhound}
   */
  buildRemoteSource(): void {
    const sourceConfig = {
      mappingValue: this.options.mappingValue,
      remoteUrl: this.options.remoteUrl,
    };

    this.entityRemoteSource = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.whitespace,
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      identify(obj: any) {
        return obj[sourceConfig.mappingValue];
      },
      remote: {
        url: sourceConfig.remoteUrl,
        cache: false,
        wildcard: this.options.queryWildcard,
        transform(response: any) {
          if (!response) {
            return [];
          }
          return response;
        },
      },
    });
  }

  /**
   * Removes selected items.
   */
  clearSelectedItems(): void {
    this.$selectionContainer.empty();
  }

  /**
   * When the component is configured to have only one selected element on each selection
   * the previous selection is removed and then replaced.
   *
   * @param selectedItem {Object}
   * @returns {boolean}
   */
  replaceSelectedItem(selectedItem: any): boolean {
    this.clearSelectedItems();
    this.addSelectedContentToContainer(selectedItem);

    return true;
  }

  /**
   * When the component is configured to have more than one selected item on each selection
   * the item is added to the list.
   *
   * @param selectedItem {Object}
   * @returns {boolean}
   */
  appendSelectedItem(selectedItem: any): boolean {
    // If collection length is up to limit, return
    const $entityItems = $(this.options.entityItemSelector, this.$selectionContainer);

    if (this.options.dataLimit !== 0 && $entityItems.length >= this.options.dataLimit) {
      return false;
    }

    this.addSelectedContentToContainer(selectedItem);

    return true;
  }

  /**
   * Add the selected content to the selection container, the HTML is generated based on the render function
   * then a hidden input is automatically added inside it, and finally the rendered selection is added to the list.
   *
   * @param selectedItem {Object}
   */
  addSelectedContentToContainer(selectedItem: any) {
    const newIndex = this.$selectionContainer.children().length;
    const selectedHtml = this.renderSelected(selectedItem, newIndex);

    const $selectedNode = $(selectedHtml);
    const $hiddenInput = $('input[type="hidden"]', $selectedNode);

    const $entityDelete = $(this.options.entityDeleteSelector, $selectedNode);
    $entityDelete.toggle(!!this.options.allowDelete);

    this.$selectionContainer.append($selectedNode);

    // Trigger the change so that listeners detect the form data has been modified
    $hiddenInput.trigger('change');

    if (typeof this.options.onSelectedContent !== 'undefined') {
      this.options.onSelectedContent($selectedNode, selectedItem);
    }
  }

  /**
   * Render the selected element, this will be appended in the selection list (ul),
   * no need to include the hidden input as it is automatically handled in addSelectedContentToContainer
   *
   * @param {Object} entity
   * @param {int} index
   *
   * @returns {string}
   */
  renderSelected(entity: any, index: int): string {
    // @todo: this part is quite restrictive as it limits to only three field, it should be more dynamic and rely on
    // a configurable object that would be a hashmap of { entityFieldName: __template_placeholder__ } and loop through
    // it (the default value would still be composed of, at least, value and display an potentially image but maybe not)
    const value = entity[this.options.mappingValue] || 0;
    const display = entity[this.options.mappingDisplay] || '';
    const image = entity[this.options.mappingImage] || '';

    return this.options.prototypeTemplate
      .replace(new RegExp(this.options.prototypeName, 'g'), index)
      .replace(new RegExp(this.options.prototypeValue, 'g'), value)
      .replace(new RegExp(this.options.prototypeImage, 'g'), image)
      .replace(new RegExp(this.options.prototypeDisplay, 'g'), display);
  }
}
