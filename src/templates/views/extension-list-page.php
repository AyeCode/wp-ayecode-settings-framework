<?php
/**
 * Template View: Extension List Page
 * Renders the UI for browsing and installing extensions.
 * @package AyeCode\SettingsFramework
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
<div x-data="extensionListComponent()">

    <template x-if="$root.config && $root.config.page_config && $root.config.page_config.connect_banner && !$root.config.page_config.connect_banner.is_connected">
        <div class="p-3 mb-4 border rounded bg-light-subtle">
            <div x-show="!$root.config.page_config.connect_banner.is_localhost" class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="fw-bold">Connect Your Site for Seamless Updates</h6>
                    <p class="mb-0 text-muted small">Unlock one-click installations and automatic updates. <a :href="$root.config.page_config.connect_banner.learn_more_url" target="_blank" rel="noopener">Learn more</a>.</p>
                </div>
                <a :href="$root.config.page_config.connect_banner.connect_url" class="btn btn-primary">Connect Site</a>
            </div>

            <div x-show="$root.config.page_config.connect_banner.is_localhost" x-cloak class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="fw-bold">Connect Site is Unavailable on Localhost</h6>
                    <p class="mb-0 text-muted small">To activate products on a local site, please use your membership key.</p>
                </div>
                <button class="btn btn-secondary" @click="$root.navigateTo(() => $root.switchSection('membership'))">Enter Membership Key</button>
            </div>
        </div>
    </template>

    <h2 class="h3" x-text="$root.activePageConfig.name"></h2>
    <template x-if="$root.activePageConfig.description">
        <p class="text-muted" x-html="$root.activePageConfig.description"></p>
    </template>
    <hr class="my-4">

    <div class="d-flex justify-content-between align-items-center mb-4">
        <div class="btn-group btn-group-sm">
            <button type="button" class="btn" @click="$root.extensionPriceFilter = 'all'" :class="$root.extensionPriceFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'">All</button>
            <button type="button" class="btn" @click="$root.extensionPriceFilter = 'paid'" :class="$root.extensionPriceFilter === 'paid' ? 'btn-primary' : 'btn-outline-secondary'">Paid</button>
            <button type="button" class="btn" @click="$root.extensionPriceFilter = 'free'" :class="$root.extensionPriceFilter === 'free' ? 'btn-primary' : 'btn-outline-secondary'">Free</button>
        </div>
        <div class="input-group input-group-sm" style="max-width: 250px;">
            <input type="search" class="form-control" x-model.debounce.300ms="$root.extensionSearchQuery" placeholder="Search...">
            <span class="input-group-text bg-transparent"><i class="fa-solid fa-magnifying-glass"></i></span>
        </div>
    </div>

    <div x-show="$root.isFetchingExtensions" class="text-center p-5">
        <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>
        <p class="mt-2 text-muted">Fetching extensions...</p>
    </div>

    <div x-show="!$root.isFetchingExtensions && filteredItems.length > 0" class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4" x-cloak>
        <template x-for="item in filteredItems" :key="item.info.slug">
            <div class="col">
                <div class="card h-100">
                    <img :src="item.info.thumbnail" class="card-img-top border-bottom" alt="">
                    <div class="card-body">
                        <h5 class="card-title" x-text="item.info.title"></h5>
                        <div class="card-text text-muted small" x-html="item.info.excerpt"></div>
                    </div>
                    <div class="card-footer bg-transparent border-0 pb-3 d-flex justify-content-between align-items-center">
                        <span class="fw-bold text-muted" x-text="get_price_text(item)"></span>
                        <button
                                class="btn btn-sm"
                                :class="get_button_state(item).class"
                                @click="handle_action(item, get_button_state(item).action)"
                                :disabled="get_button_state(item).action === null"
                        >
                            <span x-text="get_button_state(item).text"></span>
                        </button>
                    </div>
                </div>
            </div>
        </template>
    </div>

    <div x-show="!$root.isFetchingExtensions && filteredItems.length === 0" class="text-center p-5 border rounded bg-body" x-cloak>
        <p class="h5 text-muted">No extensions found matching your criteria.</p>
    </div>
</div>