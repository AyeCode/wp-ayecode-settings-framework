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
            <div class="accordion accordion-flush" id="sidebarAccordion">
                <template x-for="section in sections" :key="section.id">
                    <div class="accordion-item bg-transparent border-0">
                        <h2 class="accordion-header">
                            <button class="accordion-button collapsed nav-link text-dark-subtle d-flex align-items-center w-100 p-3 border-0 bg-transparent shadow-none"
                                    :class="{'bg-primary-subtle': currentSection === section.id, 'no-subsections': !section.subsections}"
                                    type="button"
                                    :data-bs-toggle="section.subsections ? 'collapse' : null"
                                    :data-bs-target="section.subsections ? '#collapse-' + section.id : null"
                                    :aria-expanded="currentSection === section.id"
                                    :aria-controls="'collapse-' + section.id"
                                    @click.prevent="switchSection(section.id)">
                                <i :class="section.icon || 'fa-solid fa-gear'" class="fa-fw me-3 text-muted"></i>
                                <span class="flex-grow-1" :class="currentSection === section.id ? 'fw-bold' : 'fw-semibold'" x-text="section.name"></span>
                            </button>
                        </h2>
                        <div :id="'collapse-' + section.id"
                             class="accordion-collapse collapse"
                             :class="{'show': currentSection === section.id}"
                             data-bs-parent="#sidebarAccordion"
                             x-show="section.subsections">
                            <div class="accordion-body p-0">
                                <div class="nav flex-column py-1 pe-2 ps-4">
                                    <template x-for="subsection in section.subsections" :key="subsection.id">
                                        <a href="#" class="nav-link"
                                           :class="{ 'bg-primary-subtle rounded': currentSubsection === subsection.id, 'text-dark-subtle': currentSubsection !== subsection.id }"
                                           @click.prevent="switchSubsection(subsection.id)">
                                            <span x-text="subsection.name"></span>
                                        </a>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </nav>
    </div>
</aside>

<style>
    /* Hide Bootstrap's default accordion chevron icon when no subsections */
    .accordion-button.no-subsections::after {
        display: none;
    }
</style>