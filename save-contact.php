<?php
// Serves the Emanna Digital contact card so phones offer "Add to Contacts".
header('Content-Type: text/vcard; charset=utf-8');
header('Content-Disposition: inline; filename="Emanna-Digital.vcf"');
header('Cache-Control: no-cache');
header('X-Robots-Tag: noindex');
readfile(__DIR__ . '/emanna-digital-david.vcf');
