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

declare(strict_types=1);

namespace Tests\Integration\Behaviour\Features\Context\Domain\Product\Combination;

use PrestaShop\PrestaShop\Core\Domain\Product\Combination\Query\GetCombinationForEditing;
use PrestaShop\PrestaShop\Core\Domain\Product\Combination\Query\GetEditableCombinationsList;
use PrestaShop\PrestaShop\Core\Domain\Product\Combination\QueryResult\CombinationForEditing;
use PrestaShop\PrestaShop\Core\Domain\Product\Combination\QueryResult\CombinationListForEditing;
use Tests\Integration\Behaviour\Features\Context\Domain\Product\AbstractProductFeatureContext;

abstract class AbstractCombinationFeatureContext extends AbstractProductFeatureContext
{
    /**
     * @param string $productReference
     * @param int|null $limit
     * @param int|null $offset
     * @param array<string, mixed> $filters
     *
     * @return CombinationListForEditing
     */
    protected function getCombinationsList(string $productReference, ?int $limit = null, ?int $offset = null, array $filters = []): CombinationListForEditing
    {
        return $this->getQueryBus()->handle(new GetEditableCombinationsList(
            $this->getSharedStorage()->get($productReference),
            $this->getDefaultLangId(),
            $limit,
            $offset,
            //@todo: implement sorting in scenarios
            null,
            null,
            $filters
        ));
    }

    /**
     * @param string $combinationReference
     *
     * @return CombinationForEditing
     */
    protected function getCombinationForEditing(string $combinationReference): CombinationForEditing
    {
        return $this->getQueryBus()->handle(new GetCombinationForEditing(
            $this->getSharedStorage()->get($combinationReference)
        ));
    }
}
