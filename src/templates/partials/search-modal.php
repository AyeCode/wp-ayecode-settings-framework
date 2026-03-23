<?php
/**
 * Template Part: Search Modal
 *
 * Renders the search modal dialog.
 *
 * @package AyeCode\SettingsFramework
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}
?>
<div class="modal fade" id="asf-search-modal" tabindex="-1">
    <div class="modal-dialog modal-dialog-scrollable modal-lg">
        <div class="modal-content">
            <div class="modal-header border-0 pb-0">
                <div class="input-group">
                    <span class="input-group-text bg-transparent border-0 border-bottom rounded-0"><i class="fa-solid fa-magnifying-glass"></i></span>
                    <input type="search" class="form-control bg-transparent border-0 border-bottom rounded-0" id="asf-search-input" :placeholder="strings.search_placeholder" x-model.debounce.300ms="searchQuery">
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="<?php esc_attr_e( 'Close', 'ayecode-connect' ); ?>"></button>
            </div>
            <div class="modal-body">
                <div x-show="!searchQuery" class="text-center text-muted p-5"><p><?php esc_html_e( 'Start typing to search for settings.', 'ayecode-connect' ); ?></p></div>
                <div x-show="searchQuery && groupedSearchResults.length === 0" class="text-center text-muted p-5" x-cloak><p><?php esc_html_e( 'No results found for', 'ayecode-connect' ); ?> <strong x-text="searchQuery"></strong></p></div>
                <div x-show="groupedSearchResults.length > 0" x-cloak>
                    <template x-for="group in groupedSearchResults" :key="group.groupTitle">
                        <div class="mb-3">

                            <template x-if="!group.isCustomGroup">
                                <div>
                                    <a href="#" @click.prevent="goToSection(group.sectionId, group.subsectionId)" class="text-decoration-none text-muted">
                                        <h5 class="px-3 py-2 bg-primary-subtle rounded d-flex align-items-center">
                                            <i :class="group.sectionIcon || 'fa-solid fa-gear'" class="fa-fw me-2 text-muted"></i>
                                            <span x-html="group.groupTitle"></span>
                                        </h5>
                                    </a>
                                    <ul class="list-group list-group-flush">
                                        <template x-for="result in group.results" :key="result.type === 'field' ? result.field.id : result.id">
                                            <li class="list-group-item list-group-item-action border-0 rounded py-1">
                                                <a href="#" @click.prevent="goToSearchResult(result)" class="text-decoration-none text-dark-subtle d-block p-2">
                                                    <div x-text="result.type === 'field' ? result.field.label : result.name"></div>
                                                    <template x-if="result.type === 'field' && result.field.description">
                                                        <div class="small text-muted" x-text="result.field.description?.replace(/<[^>]*>/g, '')"></div>
                                                    </template>
                                                </a>
                                            </li>
                                        </template>
                                    </ul>
                                </div>
                            </template>

                            <template x-if="group.isCustomGroup">
                                <div>
                                    <h5 class="px-3 py-2 bg-primary-subtle rounded d-flex align-items-center">
                                        <i :class="group.sectionIcon" class="fa-fw me-2 text-muted"></i>
                                        <span x-text="group.groupTitle"></span>
                                    </h5>
                                    <ul class="list-group list-group-flush">
                                        <template x-for="result in group.results" :key="result.url">
                                            <li class="list-group-item list-group-item-action border-0 rounded py-1">
                                                <a href="#" @click.prevent="goToCustomLink(result)" class="text-decoration-none text-dark-subtle d-block p-2">
                                                    <div class="fw-bold">
                                                        <i :class="result.icon" class="fa-fw me-2 text-muted"></i>
                                                        <span x-text="result.title"></span>
                                                        <i x-show="result.external" class="fa-solid fa-up-right-from-square fa-xs ms-1"></i>
                                                    </div>
                                                    <div class="small text-muted" x-show="result.description" x-text="result.description?.replace(/<[^>]*>/g, '')"></div>
                                                </a>
                                            </li>
                                        </template>
                                    </ul>
                                </div>
                            </template>

                        </div>
                    </template>
                </div>
            </div>
        </div>
    </div>
</div>