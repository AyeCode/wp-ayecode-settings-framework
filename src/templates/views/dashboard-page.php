<?php
/**
 * Template View: Dashboard Page
 *
 * Renders the content for a page of type 'dashboard'.
 *
 * @package AyeCode\SettingsFramework
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}
?>
<div x-data="dashboardComponent(activePageConfig)">

    <div class="row g-4">
        <template x-for="widget in activePageConfig.widgets" :key="widget.id">
            <div :class="{
                'col-12': widget.width === 'full',
                'col-lg-6 col-12': widget.width === 'half',
                'col-lg-4 col-12': widget.width === 'third'
            }">
                <div class="card h-100 mw-100 p-0">
                    <div class="card-header bg-light-subtle">
                        <h6 class="fw-bold mb-0" x-text="widget.title"></h6>
                    </div>
                    <div class="card-body">

                        <div x-show="isLoading[widget.id]" class="text-center p-5" x-cloak>
                            <div class="spinner-border text-primary" role="status"></div>
                        </div>

                        <div x-show="!isLoading[widget.id]" x-cloak>
                            <template x-if="widget.type === 'custom_html'">
                                <div x-html="widget.content"></div>
                            </template>

                            <template x-if="widget.type === 'quick_links'">
                                <ul class="list-group list-group-flush">
                                    <template x-for="link in widget.links" :key="link.label">
                                        <li class="list-group-item px-0">
                                            <a :href="link.url ? link.url : '#'"
                                               @click.prevent="link.section ? goToSection(link.section) : (link.external ? window.open(link.url, '_blank') : (link.url ? window.location.href = link.url : null))"
                                               class="text-decoration-none text-body d-flex align-items-center">
                                                <i :class="link.icon" class="fa-fw me-3 text-muted"></i>
                                                <span x-text="link.label"></span>
                                                <i x-show="link.external" class="fa-solid fa-up-right-from-square fa-xs ms-auto text-muted"></i>
                                            </a>
                                        </li>
                                    </template>
                                </ul>
                            </template>

                            <template x-if="widget.type === 'stats'">
                                <div class="row g-3">
                                    <template x-for="stat in (widgetData[widget.id]?.stats || [])" :key="stat.label">
                                        <div class="col-md-6 col-12">
                                            <div class="d-flex align-items-center bg-light-subtle rounded p-3">
                                                <i :class="stat.icon" class="fa-2x fa-fw text-primary me-3"></i>
                                                <div>
                                                    <div class="fs-4 fw-bold" x-text="stat.value"></div>
                                                    <div class="small text-muted" x-text="stat.label"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </template>
                                </div>
                            </template>

                            <template x-if="widget.type === 'system_status'">
                                <ul class="list-group list-group-flush">
                                    <template x-for="item in (widgetData[widget.id]?.status || [])" :key="item.label">
                                        <li class="list-group-item px-0 d-flex justify-content-between align-items-center">
                                            <div>
                                                <i class="fa-solid fa-circle me-2" :class="{ 'text-success': item.status === 'good', 'text-warning': item.status === 'warning', 'text-danger': item.status === 'error' }"></i>
                                                <span x-text="item.label"></span>
                                            </div>
                                            <span class="badge bg-secondary-subtle text-body-secondary" x-text="item.value"></span>
                                        </li>
                                    </template>
                                </ul>
                            </template>

                            <template x-if="widget.type === 'rss_feed'">
                                <ul class="list-group list-group-flush">
                                    <template x-for="item in (widgetData[widget.id]?.items || [])" :key="item.url">
                                        <li class="list-group-item px-0">
                                            <a :href="item.url" target="_blank" rel="noopener noreferrer" class="text-decoration-none d-flex align-items-center">
                                                <template x-if="item.image">
                                                    <img :src="item.image" class="me-3 rounded" style="width: 64px; height: 64px; object-fit: cover;">
                                                </template>
                                                <div>
                                                    <div class="fw-bold" x-text="item.title"></div>
                                                    <small class="text-muted" x-text="item.date"></small>
                                                </div>
                                            </a>
                                        </li>
                                    </template>
                                    <li x-show="!widgetData[widget.id]?.items?.length" class="list-group-item px-0 text-muted">
                                        Could not load feed.
                                    </li>
                                </ul>
                            </template>

                            <template x-if="widgetData[widget.id]?.error">
                                <div class="alert alert-warning" x-text="widgetData[widget.id].error"></div>
                            </template>

                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</div>