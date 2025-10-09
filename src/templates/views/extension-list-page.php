<?php
/**
 * Template View: Extension List Page
 * Renders the UI for browsing and installing extensions.
 * @package AyeCode\SettingsFramework
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
<div
        x-data="extensionListComponent(activePageConfig)"
        x-effect="update_config(activePageConfig)"
>

    <template x-if="config && config.page_config && config.page_config.connect_banner && !config.page_config.connect_banner.is_connected">
        <div class="p-3 mb-4 border rounded bg-light-subtle">
            <div x-show="!config.page_config.connect_banner.is_localhost" class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="fw-bold">Connect Your Site for Seamless Updates</h6>
                    <p class="mb-0 text-muted small">Unlock one-click installations and automatic updates. <a :href="config.page_config.connect_banner.learn_more_url" target="_blank" rel="noopener">Learn more</a>.</p>
                </div>
                <a :href="config.page_config.connect_banner.connect_url" class="btn btn-primary">Connect Site</a>
            </div>

            <div x-show="config.page_config.connect_banner.is_localhost" x-cloak class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="fw-bold">Connect Site is Unavailable on Localhost</h6>
                    <p class="mb-0 text-muted small">To activate products on a local site, please use your membership key.</p>
                </div>
                <button class="btn btn-secondary" @click="navigateTo(() => switchSection('membership'))">Enter Membership Key</button>
            </div>
        </div>
    </template>

    <template x-if="config">
        <div>
            <h2 class="h3" x-text="config.name"></h2>
            <template x-if="config.description">
                <p class="text-muted" x-html="config.description"></p>
            </template>
            <hr class="my-4">
        </div>
    </template>


    <div class="d-flex justify-content-between align-items-center mb-4">
        <div class="btn-group btn-group-sm">
            <button type="button" class="btn" @click="priceFilter = 'all'" :class="priceFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'">All</button>
            <button type="button" class="btn" @click="priceFilter = 'paid'" :class="priceFilter === 'paid' ? 'btn-primary' : 'btn-outline-secondary'">Paid</button>
            <button type="button" class="btn" @click="priceFilter = 'free'" :class="priceFilter === 'free' ? 'btn-primary' : 'btn-outline-secondary'">Free</button>
        </div>
        <div class="input-group input-group-sm" style="max-width: 250px;">
            <input type="search" class="form-control" x-model.debounce.300ms="searchQuery" placeholder="Search...">
            <span class="input-group-text bg-transparent"><i class="fa-solid fa-magnifying-glass"></i></span>
        </div>
    </div>

    <div x-show="isLoading" class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4" x-cloak>
        <template x-for="i in 6" :key="i">
            <div class="col">
                <div class="card h-100 p-0" aria-hidden="true">
                    <div class="ratio ratio-4x3x bg-light-subtle border-bottom" style="--bs-aspect-ratio: 66%;">
                    </div>
                    <div class="card-body">
                        <h5 class="card-title placeholder-glow">
                            <span class="placeholder col-8"></span>
                        </h5>
                        <p class="card-text placeholder-glow">
                            <span class="placeholder col-7"></span>
                            <span class="placeholder col-4"></span>
                            <span class="placeholder col-4"></span>
                            <span class="placeholder col-6"></span>
                            <span class="placeholder col-8"></span>
                            <span class="placeholder col-6"></span>
                            <span class="placeholder col-9"></span>
                        </p>
                    </div>
                    <div class="card-footer bg-light-subtle border-0 py-3 d-flex justify-content-between align-items-center">
                        <span class="placeholder placeholder-lg col-3"></span>
                        <a href="#" tabindex="-1" class="btn btn-primary disabled placeholder col-4"></a>
                    </div>
                </div>
            </div>
        </template>
    </div>

    <div x-show="!isLoading && filteredItems && filteredItems.length > 0" class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4" x-cloak>
        <template x-for="item in filteredItems" :key="item.info.slug">
            <div class="col">
                <div class="card h-100 p-0 hover-shadow position-relative">
                    <div class="hover-effect-scale hover-effect-opacity card-img-top position-relative overflow-hidden ">
                        <span class="hover-effect-target position-absolute top-0 start-0 w-100 h-100 bg-black bg-opacity-25 opacity-0 z-1"></span>
                        <div class="hover-effect-target d-flex position-absolute top-0 start-0 w-100 h-100 align-items-center justify-content-center z-2 opacity-0">
                            <div class="d-flex align-items-center gap-3 fs-sm bg-dark bg-opacity-50 text-white rounded-pill py-2 px-3">
                              <span class="d-flex align-items-center fw-medium">
                                  <a :href="item.info.link" target="_blank" class="stretched-link link-light">More info</a>
                              </span>

                            </div>
                        </div>
                        <div class="ratio hover-effect-targetx" style="--bs-aspect-ratio: 66%;">
                            <img :src="item.info.thumbnail" class="card-img-top border-bottom embed-item-cover-xy position-relativex" alt="">
                        </div>
                    </div>

                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title" x-text="item.info.title"></h5>
                        <p class="card-text text-muted fs-xs flex-grow-1" x-html="item.info.excerpt"></p>
                    </div>
                    <div class="card-footer bg-light-subtle border-0 py-3 d-flex justify-content-between align-items-center">
                        <p class="h6 text-dark-subtle mb-0" x-html="get_price_text(item)"></p>
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

    <div x-show="!isLoading && filteredItems && filteredItems.length === 0" class="text-center p-5 border rounded bg-body" x-cloak>
        <p class="h5 text-muted">No extensions found matching your criteria.</p>
    </div>
</div>