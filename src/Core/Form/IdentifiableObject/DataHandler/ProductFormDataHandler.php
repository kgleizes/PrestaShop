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

namespace PrestaShop\PrestaShop\Core\Form\IdentifiableObject\DataHandler;

use PrestaShop\PrestaShop\Core\CommandBus\CommandBusInterface;
use PrestaShop\PrestaShop\Core\Domain\Product\Command\AddProductCommand;
use PrestaShop\PrestaShop\Core\Domain\Product\ValueObject\ProductId;
use PrestaShop\PrestaShop\Core\Form\IdentifiableObject\CommandBuilder\Product\ProductCommandsBuilder;

/**
 * Handles data posted from product form
 */
class ProductFormDataHandler implements FormDataHandlerInterface
{
    /**
     * @var CommandBusInterface
     */
    private $bus;

    /**
     * @var ProductCommandsBuilder
     */
    private $commandsBuilder;

    /**
     * @param CommandBusInterface $bus
     * @param ProductCommandsBuilder $commandsBuilder
     */
    public function __construct(
        CommandBusInterface $bus,
        ProductCommandsBuilder $commandsBuilder
    ) {
        $this->bus = $bus;
        $this->commandsBuilder = $commandsBuilder;
    }

    /**
     * {@inheritdoc}
     */
    public function create(array $data): int
    {
        $createCommand = new AddProductCommand($data['type']);

        /** @var ProductId $productId */
        $productId = $this->bus->handle($createCommand);

        return $productId->getValue();
    }

    /**
     * {@inheritdoc}
     */
    public function update($id, array $data)
    {
        $commands = $this->commandsBuilder->buildCommands(new ProductId($id), $data);

        foreach ($commands as $command) {
            $this->bus->handle($command);
        }
    }
}
