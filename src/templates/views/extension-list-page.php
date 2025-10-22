<?php
/**
 * Template View: Extension List Page
 * Renders the UI for browsing and installing extensions.
 * @package AyeCode\SettingsFramework
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
<div
        x-data="extensionListComponent({ ...activePageConfig, page_config: config.page_config })"
        x-effect="update_config(activePageConfig)"
>

    <template x-if="config && config.page_config && config.page_config.connect_banner && !config.page_config.connect_banner.is_connected">
        <div class="p-3 mb-4 border rounded bg-light-subtle">

            <div x-show="!config.page_config.connect_banner.is_localhost">
                <div  class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="fw-bold"><?php esc_html_e( 'Connect Your Site for Seamless Updates', 'ayecode-connect' ); ?></h6>
                        <p class="mb-0 text-muted small"><?php esc_html_e( 'Unlock one-click installations and automatic updates.', 'ayecode-connect' ); ?> <a :href="config.page_config.connect_banner.learn_more_url" target="_blank" rel="noopener"><?php esc_html_e( 'Learn more', 'ayecode-connect' ); ?></a>.</p>
                    </div>
                    <button @click="connect_site" class="btn btn-primary" :disabled="isConnecting">
                        <span x-show="isConnecting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                        <span x-text="isConnecting ? '<?php echo esc_js( __( 'Connecting...', 'ayecode-connect' ) ); ?>' : '<?php echo esc_js( __( 'Connect Site', 'ayecode-connect' ) ); ?>'"></span>
                    </button>
                </div>
            </div>

            <div x-show="config.page_config.connect_banner.is_localhost" x-cloak >
                <div class="d-flex justify-content-between align-items-center">

                    <div>
                        <h6 class="fw-bold"><?php esc_html_e( 'Connect Site is Unavailable on Localhost', 'ayecode-connect' ); ?></h6>
                        <p class="mb-0 text-muted small"><?php esc_html_e( 'To activate products on a local site, please use your membership key or enter individual keys on the plugin page.', 'ayecode-connect' ); ?></p>
                    </div>
                    <button class="btn btn-secondary" @click="navigateTo(() => switchSection('membership'))">
                        <?php esc_html_e( 'Enter Membership Key', 'ayecode-connect' ); ?>
                    </button>
                </div>
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
            <button type="button" class="btn" @click="priceFilter = 'all'" :class="priceFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'"><?php esc_html_e( 'All', 'ayecode-connect' ); ?></button>
            <button type="button" class="btn" @click="priceFilter = 'paid'" :class="priceFilter === 'paid' ? 'btn-primary' : 'btn-outline-secondary'"><?php esc_html_e( 'Paid', 'ayecode-connect' ); ?></button>
            <button type="button" class="btn" @click="priceFilter = 'free'" :class="priceFilter === 'free' ? 'btn-primary' : 'btn-outline-secondary'"><?php esc_html_e( 'Free', 'ayecode-connect' ); ?></button>
        </div>
        <div class="input-group input-group-sm" style="max-width: 250px;">
            <input type="search" class="form-control" x-model.debounce.300ms="searchQuery" placeholder="<?php esc_attr_e( 'Search...', 'ayecode-connect' ); ?>">
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
                    <div class="hover-effect-scale hover-effect-opacity card-img-top position-relative overflow-hidden h6 ">
                        <span class="hover-effect-target position-absolute top-0 start-0 w-100 h-100 bg-black bg-opacity-25 opacity-0 z-1"></span>
                        <div class="hover-effect-target d-flex position-absolute top-0 start-0 w-100 h-100 align-items-center justify-content-center z-2 opacity-0">
                            <div class="d-flex align-items-center gap-3 fs-sm bg-dark bg-opacity-50 text-white rounded-pill py-2 px-3">
                              <span class="d-flex align-items-center fw-medium">
                                  <a href="#" @click.prevent="show_more_info(item)" class="stretched-link link-light"><?php esc_html_e( 'More info', 'ayecode-connect' ); ?></a>
                              </span>

                            </div>
                        </div>
                        <div class="ratio hover-effect-targetx" style="--bs-aspect-ratio: 66%;">
                            <img :src="item.info.thumbnail" class="card-img-top border-bottom embed-item-cover-xy position-relativex" alt="">
                        </div>
                        <template x-if="item.info.is_new">
                            <span class="badge text-dangerx bg-danger xbg-danger-subtle position-absolute top-0 end-0 m-2">NEW</span>
                        </template>
                        <span class="badge position-absolute top-0 start-0 m-2"
                              :class="(item.info.price === 0 || item.info.price === '0.00') ? 'bg-success-subtle text-success' : 'bg-primary-subtle text-primary'"
                              x-html="get_price_text(item)"></span>
                    </div>

                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title" x-text="item.info.title"></h5>
                        <p class="card-text text-muted fs-xs flex-grow-1" x-html="item.info.excerpt"></p>
                    </div>
                    <div class="card-footer bg-light-subtle border-0 py-3 d-flex justify-content-between align-items-center">
                        <button @click="show_more_info(item)" class="btn btn-sm btn-outline-secondary"><?php esc_html_e( 'More info', 'ayecode-connect' ); ?></button>
                        <span x-text="item.status"></span>
                        <div class="d-flex align-items-center justify-content-between"
                             data-bs-toggle="tooltip"
                             :title="item.status === 'active' && item.type === 'theme' ? 'This theme is active. Activate another theme to switch.' : ''"
                        >
                            <div x-show="itemActionInProgress[item.info.slug]" class="spinner-border spinner-border-sm text-primary me-2" role="status" x-cloak>
                                <span class="visually-hidden"><?php esc_html_e( 'Loading...', 'ayecode-connect' ); ?></span>
                            </div>
                            <div
                                    class="form-check form-switch d-flex align-items-center mb-0 me-n3 pe-1"
                                    :class="{ 'pe-none': item.status === 'active' && item.type === 'theme' }"

                            >
                                <input
                                        class="form-check-input"
                                        type="checkbox"
                                        role="switch"
                                        :id="'toggle-' + item.info.slug"
                                        :checked="item.status === 'active'"
                                        :disabled="!!itemActionInProgress[item.info.slug] || (item.status === 'active' && item.type === 'theme')"
                                        @change="handle_toggle(item, $event)"
                                >
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </template>
    </div>

    <div x-show="!isLoading && filteredItems && filteredItems.length === 0" class="text-center p-5 border rounded bg-body" x-cloak>
        <p class="h5 text-muted"><?php esc_html_e( 'No extensions found matching your criteria.', 'ayecode-connect' ); ?></p>
    </div>

    <div class="modal fade" x-ref="connectModal" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false">
        <div class="modal-dialog modal-sm modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-body text-center p-4">
                    <div class="spinner-border text-primary mb-3" role="status"></div>
                    <h5 class="mb-0"><?php esc_html_e( 'Preparing to Connect...', 'ayecode-connect' ); ?></h5>
                    <p class="text-muted small mt-2 mb-0"><?php esc_html_e( 'Please wait while we install and activate the necessary components.', 'ayecode-connect' ); ?></p>
                </div>
            </div>
        </div>
    </div>

    <div class="modal" x-ref="purchaseModal" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content p-0 rounded overflow-hidden">
                <div class="modal-body p-0">
                    <button type="button" class="btn-close position-absolute p-3 end-0 z-index-1" data-bs-dismiss="modal" aria-label="<?php esc_attr_e( 'Close', 'ayecode-connect' ); ?>"></button>
                    <div class="row g-0 align-items-start">
                        <div class="col-lg-6 bg-light">
                            <div class="card bg-body-tertiary rounded-0 m-0 border-0 p-4 p-md-5 d-flex flex-column justify-content-top h-100">
                                <h4 class="fw-bold"><?php esc_html_e( 'Already a Member?', 'ayecode-connect' ); ?></h4>
                                <p class="text-muted mb-4"><?php esc_html_e( 'If you\'re an existing member, connect your account to get started.', 'ayecode-connect' ); ?></p>
                                <ul class="list-unstyled mb-4">
                                    <li class="d-flex align-items-center mb-2"><i class="fa-solid fa-circle-check fa-fw me-2 text-success"></i> <?php esc_html_e( 'No more license keys', 'ayecode-connect' ); ?></li>
                                    <li class="d-flex align-items-center mb-2"><i class="fa-solid fa-circle-check fa-fw me-2 text-success"></i> <?php esc_html_e( 'One-click installs', 'ayecode-connect' ); ?></li>
                                    <li class="d-flex align-items-center mb-2"><i class="fa-solid fa-circle-check fa-fw me-2 text-success"></i> <?php esc_html_e( 'Full demo site imports', 'ayecode-connect' ); ?></li>
                                    <li class="d-flex align-items-center"><i class="fa-solid fa-circle-check fa-fw me-2 text-success"></i> <?php esc_html_e( 'Documentation & support widget', 'ayecode-connect' ); ?></li>
                                </ul>
                                <div class="d-grid">
                                    <button type="button" class="btn btn-primary btn-lg text-start ps-3" @click="connect_site()">
                                        <div class="d-flex align-items-center">
                                            <i class="fas fa-rocket fa-lg me-3"></i>
                                            <div>
                                                <?php esc_html_e( 'Connect & Install', 'ayecode-connect' ); ?>
                                                <span class="d-block small opacity-75 fw-normal"><?php esc_html_e( 'One-click install & automatic updates', 'ayecode-connect' ); ?></span>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                                <div class="text-center mt-3">
                                    <a href="#" class="small" @click.prevent="purchaseModal.hide(); $dispatch('navigate-to-section', { sectionId: 'membership' })"><?php esc_html_e( 'Working on a local site? Enter your key instead.', 'ayecode-connect' ); ?></a>
                                </div>
                            </div>
                        </div>

                        <div class="col-lg-6">
                            <div class="card rounded-0 m-0 border-0 p-4 p-md-5 d-flex flex-column justify-content-top h-100">
                                <h4 class="fw-bold"><?php esc_html_e( 'New Customer?', 'ayecode-connect' ); ?></h4>
                                <p class="text-muted mb-4"><?php esc_html_e( 'Get the extension and much more with a membership.', 'ayecode-connect' ); ?></p>
                                <ul class="list-unstyled mb-4">
                                    <li class="d-flex align-items-center mb-2"><i class="fa-solid fa-circle-check fa-fw me-2 text-success"></i> <?php esc_html_e( 'Membership includes all addons', 'ayecode-connect' ); ?></li>
                                    <li class="d-flex align-items-center mb-2"><i class="fa-solid fa-circle-check fa-fw me-2 text-success"></i> <?php esc_html_e( 'Includes all themes', 'ayecode-connect' ); ?></li>
                                    <li class="d-flex align-items-center mb-2"><i class="fa-solid fa-circle-check fa-fw me-2 text-success"></i> <?php esc_html_e( 'Premium support', 'ayecode-connect' ); ?></li>
                                    <li class="d-flex align-items-center"><i class="fa-solid fa-circle-check fa-fw me-2 text-success"></i> <?php esc_html_e( '30-day money-back guarantee', 'ayecode-connect' ); ?></li>
                                </ul>
                                <div class="d-grid">
                                    <a :href="config.page_config?.membership_url || '#'" target="_blank" class="btn btn-success btn-lg text-start ps-3">
                                        <div class="d-flex align-items-center">
                                            <i class="fas fa-star fa-lg me-3"></i>
                                            <div>
                                                <?php esc_html_e( 'View Membership Plans', 'ayecode-connect' ); ?>
                                                <span class="d-block small opacity-75 fw-normal"><strong><?php esc_html_e( 'Best value', 'ayecode-connect' ); ?></strong> - <?php esc_html_e( 'Unlock everything', 'ayecode-connect' ); ?></span>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>