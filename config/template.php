<?php

// Di-generate oleh php artisan template:zip - hanya berisi flavor "landing-properti".
// Ganti brand/warna di bawah, atau set TEMPLATE_FLAVOR di .env.

return [
    'flavor' => env('TEMPLATE_FLAVOR', 'landing-properti'),

    'flavors' => array (
  'landing-properti' => 
  array (
    'label' => 'GRIYA NUSA — Properti',
    'brand_name' => 'GRIYA NUSA',
    'brand_tagline' => 'Temukan hunian impianmu',
    'brand_initials' => 'GN',
    'accent' => '#9a3412',
    'category' => 'properti',
    'home' => 'landings.properti',
    'nav' => 
    array (
      'sections' => 
      array (
        0 => 
        array (
          'label' => 'Menu',
          'items' => 
          array (
            0 => 
            array (
              'label' => 'Landing',
              'to' => '/landings/properti',
              'icon' => 'Home',
            ),
            1 => 
            array (
              'label' => 'Dashboard',
              'to' => '/dashboard',
              'icon' => 'LayoutDashboard',
            ),
            2 => 
            array (
              'label' => 'Pengaturan',
              'to' => '/settings',
              'icon' => 'Settings',
            ),
          ),
        ),
      ),
    ),
  ),
),
];
