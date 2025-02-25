<?php
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
class SmartyDevTemplateCore extends Smarty_Internal_Template
{
    /** @var SmartyCustom|null */
    public $smarty = null;

    /**
     * @param SmartyDevTemplateCore|null $template
     * @param null $cache_id
     * @param null $compile_id
     * @param object $parent
     * @param false $display
     * @param bool $merge_tpl_vars
     * @param false $no_output_filter
     *
     * @return string
     *
     * @throws SmartyException
     */
    // @phpstan-ignore-next-line
    public function fetch($template = null, $cache_id = null, $compile_id = null, $parent = null, $display = false, $merge_tpl_vars = true, $no_output_filter = false)
    {
        if (null !== $template) {
            $tpl = $template->template_resource;
        } else {
            $tpl = $this->template_resource;
        }

        return "\n<!-- begin $tpl -->\n"
            . parent::fetch($template, $cache_id, $compile_id, $parent)
            . "\n<!-- end $tpl -->\n";
    }
}
