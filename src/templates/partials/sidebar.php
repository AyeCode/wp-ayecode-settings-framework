<?php
/**
 * Template Part: Sidebar
 *
 * Renders the navigation sidebar with search and menu items.
 *
 * @package AyeCode\SettingsFramework
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}
?>
<aside class="asf-sidebar bg-light-subtle collapse collapse-horizontal d-lg-block" id="asf-sidebar">
    <div class="p-3">
        <button type="button" class="form-control text-start text-muted bg-light-subtle" @click="searchModal.show()">
            <i class="fa-solid fa-magnifying-glass me-2"></i>
            <span x-text="strings.search_placeholder || 'Quick search...'"></span>
            <span class="ms-auto small text-muted border rounded px-2 float-end">Ctrl+K</span>
        </button>
    </div>
    <div class="flex-grow-1" style="overflow-y: auto; width: 280px;">
        <nav class="nav flex-column py-2">
            <template x-for="section in sections" :key="section.id">
                <div class="sidebar-nav-section">
                    <a href="#" class="nav-link text-dark-subtle d-flex align-items-center w-100 p-3" :class="{'bg-primary-subtle': currentSection === section.id}" @click.prevent="switchSection(section.id)">
                        <i :class="section.icon || 'fa-solid fa-gear'" class="fa-fw me-3 text-muted"></i>
                        <span class="flex-grow-1" :class="currentSection === section.id ? 'fw-bold' : 'fw-semibold'" x-text="section.name"></span>
                        <i class="fa-solid fa-chevron-down ms-2 text-muted small" x-show="section.subsections"></i>
                    </a>
                    <div x-show="currentSection === section.id && section.subsections">
                        <div class="nav flex-column py-1 pe-2 ps-4">
                            <template x-for="subsection in section.subsections" :key="subsection.id">
                                <a href="#" class="nav-link" :class="{ 'bg-primary-subtle rounded': currentSubsection === subsection.id, 'text-dark-subtle': currentSubsection !== subsection.id }" @click.prevent="switchSubsection(subsection.id)">
                                    <span x-text="subsection.name"></span>
                                </a>
                            </template>
                        </div>
                    </div>
                </div>
            </template>
        </nav>
    </div>
</aside>