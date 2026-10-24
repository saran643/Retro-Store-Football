-- RETRO STORE DATABASE SEED DATA
-- Default Categories, Authentic Products, Variants, Images, and Initial Demo Users

USE `retro_store_db`;

-- Clear existing data if re-seeding (respect foreign keys)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `password_reset_tokens`;
TRUNCATE TABLE `reviews`;
TRUNCATE TABLE `order_items`;
TRUNCATE TABLE `orders`;
TRUNCATE TABLE `wishlists`;
TRUNCATE TABLE `cart_items`;
TRUNCATE TABLE `product_images`;
TRUNCATE TABLE `product_variants`;
TRUNCATE TABLE `products`;
TRUNCATE TABLE `categories`;
TRUNCATE TABLE `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. SEED USERS
-- Admin Password: Admin@1234
-- User Password: User@1234
INSERT INTO `users` (`user_id`, `full_name`, `email`, `phone`, `password_hash`, `role`, `status`) VALUES
(1, 'Store Administrator', 'admin@retrostore.in', '+91 98765 43210', '$2a$10$kX.iLomWZobU5.BDRUNZoOBvkBbOQqX0rnSsCqF3babQo.oSP0/ay', 'admin', 'active'),
(2, 'Arjun Sharma', 'arjun@example.com', '+91 98111 22334', '$2a$10$P2HqopWpsg6RjCUK9CFYRuQtU4X4ysNb2fvLFhJxLW.r7Pl3uRjde', 'user', 'active'),
(3, 'Rohan Sen', 'rohan@example.com', '+91 98222 33445', '$2a$10$P2HqopWpsg6RjCUK9CFYRuQtU4X4ysNb2fvLFhJxLW.r7Pl3uRjde', 'user', 'active');

-- 2. SEED CATEGORIES (All 11 Categories requested in section 6)
INSERT INTO `categories` (`category_id`, `category_name`, `description`, `image_url`) VALUES
(1, 'Classic Football Jerseys', 'Timeless kits from legendary tournaments and iconic championship nights.', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=800&q=80'),
(2, 'Retro Football Jerseys', 'Golden era vintage shirts from the 80s, 90s, and 2000s in authentic heritage cuts.', 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80'),
(3, 'Modern Football Jerseys', 'Contemporary club and international match shirts engineered with breathable fabrics.', 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=800&q=80'),
(4, 'Football Boots', 'Firm ground, turf, and artificial grass cleats engineered for ball feel and traction.', 'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=800&q=80'),
(5, 'Football Socks', 'High-stretch, moisture-wicking match socks with arch compression bands.', 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=800&q=80'),
(6, 'Grip Socks', 'Anti-slip silicone patterned athletic socks preventing heel slippage and blisters.', 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80'),
(7, 'Shin Guards', 'Ergonomic, lightweight impact-resistant guard shells with EVA foam backings.', 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80'),
(8, 'Grip Pads', 'Anatomical silicone pad inserts for enhanced boot lock-in and shock absorption.', 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=800&q=80'),
(9, 'Goalkeeper Gloves', 'Professional 4mm contact latex match gloves with negative cut and finger protection.', 'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?auto=format&fit=crop&w=800&q=80'),
(10, 'Training Equipment', 'Agility ladders, marker cones, tactical boards, and precision drills essentials.', 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=800&q=80'),
(11, 'Football Accessories', 'Match grade shin tape, brass whistles, captain armbands, ball pumps, and gear.', 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80');

-- 3. SEED PRODUCTS (Realistic football gear with affordable INR pricing)
INSERT INTO `products` (`product_id`, `category_id`, `product_name`, `description`, `price`, `original_price`, `image_url`, `stock_quantity`, `is_featured`, `is_published`) VALUES
-- Retro Jerseys
(1, 2, 'France 1998 Home Retro Kit - Zidane #10', 'The iconic blue shirt worn by Zinedine Zidane during France''s historic World Cup triumph in Paris. Features the signature horizontal tricolor chest stripes, white collar with red trim, and commemorative match embroidery.', 999.00, 1299.00, 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80', 45, 1, 1),
(2, 2, 'Manchester United 1999 Treble Final Kit', 'The revered red kit worn during the historic 1999 Champions League triumph in Barcelona. Vintage zip collar, retro Umbro diamond trims, and iconic European embroidery.', 1099.00, 1399.00, 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=800&q=80', 38, 1, 1),
(3, 2, 'Brazil 2002 World Cup Kit - Ronaldo #9', 'The immortal canary yellow shirt with royal green accents worn by Ronaldo Nazario leading Seleção to their 5th World Cup in Yokohama. Premium lightweight breathable fabric.', 1199.00, 1499.00, 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=800&q=80', 50, 1, 1),
(4, 2, 'Argentina 1986 Mexico Retro Kit - Maradona #10', 'The timeless albiceleste sky blue and white striped jersey from Diego Maradona''s legendary 1986 World Cup campaign. Features vintage woven crest and classic collar.', 1149.00, 1449.00, 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80', 30, 1, 1),
(5, 1, 'AC Milan 2007 Athens European Kit - Kaká #22', 'The elegant white European away shirt worn on the glory night in Athens. Gold piping, classic Rossoneri crest, and vintage sponsor lettering.', 999.00, 1299.00, 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&w=800&q=80', 25, 0, 1),
(6, 1, 'Arsenal 2004 Invincibles Home Kit - Henry #14', 'The golden era highbury kit worn during the unbeaten 49-game season. Classic burgundy red body with white sleeves and iconic O2 sponsor.', 1049.00, 1349.00, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80', 40, 1, 1),
(7, 1, 'Germany 1990 World Cup Kit - Matthäus #10', 'The greatest graphic jersey in football history featuring the black, red, and gold ribbon geometry across the chest. Authentic retro fit.', 1199.00, 1499.00, 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=800&q=80', 35, 1, 1),
(8, 1, 'Netherlands 1988 European Championship Kit', 'The legendary geometric orange kit worn by Ruud Gullit and Marco van Basten winning Euro 88 in Germany. Unmatched vintage aesthetic.', 1149.00, 1399.00, 'https://images.unsplash.com/photo-1516475429286-465d815a0df7?auto=format&fit=crop&w=800&q=80', 20, 0, 1),

-- Modern Jerseys
(9, 3, 'Madrid Heritage White Match Jersey 2024', 'Crisp royal white match jersey with gold trim accents, tailored athletic fit, and laser-perforated ventilation panels for intense matches.', 699.00, 899.00, 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80', 50, 0, 1),
(10, 3, 'All-Black Stealth Edition Pro Training Jersey', 'Monochrome matte black performance shirt designed for late night cage sessions and street football. Quick-dry synthetic weave.', 549.00, 699.00, 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80', 60, 0, 1),

-- Football Boots
(11, 4, 'Vintage Predator Pro FG Football Boots', 'Classic strike-zone rubber elements on soft synthetic leather upper. Firm ground conical stud configuration for aggressive bite and turn.', 1699.00, 2199.00, 'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=800&q=80', 24, 1, 1),
(12, 4, 'Retro Copa Leather Match Cleats - Black/White', 'Full-grain calfskin leather vamp with classic fold-over tongue. Durable polyurethane sole plate built for comfort across 90 minutes.', 1499.00, 1899.00, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80', 18, 1, 1),
(13, 4, 'Street Cage Turf Football Boots - Multi-Ground', 'Low-profile rubber lug outsole engineered for artificial turf and concrete surfaces. Reinforced toe bumper for durability.', 1199.00, 1499.00, 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80', 30, 0, 1),

-- Grip Socks & Socks
(14, 6, 'Pro Anti-Slip Hex Grip Socks (Pure White)', 'Diamond-pattern silicone grip dots along the footbed lock your foot securely inside the boot. Prevents blister friction during sudden acceleration.', 249.00, 349.00, 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80', 120, 1, 1),
(15, 6, 'Pro Anti-Slip Hex Grip Socks (Deep Burgundy)', 'Premium high-density combed cotton with thick cushioning under the ball and heel. Retro burgundy with muted gold accents.', 299.00, 399.00, 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=800&q=80', 95, 1, 1),
(16, 5, 'Classic Over-Calf Match Football Socks (Pack of 2)', 'Durable ribbed match socks with moisture management yarn. Anatomical left/right foot engineering.', 149.00, 199.00, 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=800&q=80', 150, 0, 1),

-- Shin Guards & Grip Pads
(17, 7, 'Pro Carbon-Weave Ultra-Light Shin Guards', 'Featherweight 35g carbon fiber textured composite shell. Shock-absorbing waffle foam lining provides maximum protection with zero bulk.', 249.00, 349.00, 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80', 70, 1, 1),
(18, 7, 'Classic Shield Shin Guards with Ankle Guard', 'Full wrap protection featuring reinforced ankle discs and stirrup straps. Ideal for tough Sunday league matches.', 199.00, 279.00, 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80', 40, 0, 1),
(19, 8, 'Dynamic Silicone Football Boot Grip Pads (Pair)', 'Adhesive textured micro-pads placed inside boot insoles to stabilize lateral heel movement and reduce shoe slop.', 179.00, 249.00, 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=800&q=80', 85, 0, 1),

-- Goalkeeper Gloves
(20, 9, 'Retro Gold Vortex Goalkeeper Gloves (4mm German Latex)', 'Supreme grip in wet and dry conditions. Negative cut palm with extended latex wrist wrap and removable finger spines.', 849.00, 1199.00, 'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?auto=format&fit=crop&w=800&q=80', 25, 1, 1),
(21, 9, 'All-Weather Club Goalkeeper Gloves - Deep Black', 'Durable latex palm engineered for artificial grass and hard pitches. Breathable neoprene backhand.', 599.00, 799.00, 'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?auto=format&fit=crop&w=800&q=80', 30, 0, 1),

-- Training Equipment & Accessories
(22, 10, 'Speed & Agility Training Set (10 Cones + Ladder)', 'Heavy-duty 4-meter agility ladder with fixed rungs and 10 high-visibility flexible saucer marker cones with carry strap.', 499.00, 699.00, 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=800&q=80', 35, 1, 1),
(23, 10, 'Tactical Magnetic Coaching Board & Planner', 'Dual-sided football whiteboard showing full pitch and penalty box diagrams. Includes 24 magnets, marker pen, and eraser.', 449.00, 599.00, 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=800&q=80', 20, 0, 1),
(24, 11, 'Match-Grade Self-Adhesive Sock Wrap Tape (Pack of 3)', 'Cohesive flexible wrap that holds shin guards and socks firmly without leaving sticky residue. Sweat-resistant.', 99.00, 149.00, 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80', 200, 0, 1),
(25, 11, 'Classic Brass Referee Match Whistle with Lanyard', 'Loud 115dB pea-less nickel-plated brass whistle. Crisp audible tone across windy open grounds. Includes lanyard.', 129.00, 189.00, 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80', 110, 0, 1),
(26, 11, 'Captain Armband - Vintage Elastic (Burgundy/Gold)', 'Bold woven elastic armband with velcro security loop. High-contrast lettering for pitch leadership.', 119.00, 169.00, 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80', 90, 0, 1);

-- 4. SEED PRODUCT VARIANTS (Sizes, Colors, SKUs, Stock)
INSERT INTO `product_variants` (`variant_id`, `product_id`, `size`, `color`, `SKU`, `stock_quantity`) VALUES
-- France 98 (Sizes S to XXL)
(1, 1, 'S', 'Blue', 'FRA98-S', 8),
(2, 1, 'M', 'Blue', 'FRA98-M', 12),
(3, 1, 'L', 'Blue', 'FRA98-L', 15),
(4, 1, 'XL', 'Blue', 'FRA98-XL', 7),
(5, 1, 'XXL', 'Blue', 'FRA98-XXL', 3),

-- Man Utd 99
(6, 2, 'S', 'Red', 'MUN99-S', 6),
(7, 2, 'M', 'Red', 'MUN99-M', 12),
(8, 2, 'L', 'Red', 'MUN99-L', 14),
(9, 2, 'XL', 'Red', 'MUN99-XL', 6),

-- Brazil 2002
(10, 3, 'S', 'Yellow', 'BRA02-S', 10),
(11, 3, 'M', 'Yellow', 'BRA02-M', 16),
(12, 3, 'L', 'Yellow', 'BRA02-L', 18),
(13, 3, 'XL', 'Yellow', 'BRA02-XL', 6),

-- Argentina 86
(14, 4, 'S', 'Sky Blue', 'ARG86-S', 6),
(15, 4, 'M', 'Sky Blue', 'ARG86-M', 10),
(16, 4, 'L', 'Sky Blue', 'ARG86-L', 10),
(17, 4, 'XL', 'Sky Blue', 'ARG86-XL', 4),

-- AC Milan 07
(18, 5, 'S', 'White', 'MIL07-S', 5),
(19, 5, 'M', 'White', 'MIL07-M', 10),
(20, 5, 'L', 'White', 'MIL07-L', 7),
(21, 5, 'XL', 'White', 'MIL07-XL', 3),

-- Arsenal 04
(22, 6, 'S', 'Red', 'ARS04-S', 8),
(23, 6, 'M', 'Red', 'ARS04-M', 14),
(24, 6, 'L', 'Red', 'ARS04-L', 12),
(25, 6, 'XL', 'Red', 'ARS04-XL', 6),

-- Germany 90
(26, 7, 'S', 'White', 'GER90-S', 7),
(27, 7, 'M', 'White', 'GER90-M', 12),
(28, 7, 'L', 'White', 'GER90-L', 11),
(29, 7, 'XL', 'White', 'GER90-XL', 5),

-- Netherlands 88
(30, 8, 'M', 'Orange', 'NED88-M', 10),
(31, 8, 'L', 'Orange', 'NED88-L', 10),

-- Madrid 2024
(32, 9, 'S', 'White', 'RMA24-S', 12),
(33, 9, 'M', 'White', 'RMA24-M', 20),
(34, 9, 'L', 'White', 'RMA24-L', 18),

-- Stealth Training Shirt
(35, 10, 'M', 'Black', 'STH-M', 30),
(36, 10, 'L', 'Black', 'STH-L', 30),

-- Predator FG Boots (UK sizes)
(37, 11, 'UK 7', 'Black/Red', 'PRED-UK7', 5),
(38, 11, 'UK 8', 'Black/Red', 'PRED-UK8', 8),
(39, 11, 'UK 9', 'Black/Red', 'PRED-UK9', 7),
(40, 11, 'UK 10', 'Black/Red', 'PRED-UK10', 4),

-- Copa Boots
(41, 12, 'UK 7', 'Black', 'COPA-UK7', 4),
(42, 12, 'UK 8', 'Black', 'COPA-UK8', 6),
(43, 12, 'UK 9', 'Black', 'COPA-UK9', 5),
(44, 12, 'UK 10', 'Black', 'COPA-UK10', 3),

-- Turf Boots
(45, 13, 'UK 7', 'Black', 'TURF-UK7', 8),
(46, 13, 'UK 8', 'Black', 'TURF-UK8', 12),
(47, 13, 'UK 9', 'Black', 'TURF-UK9', 10),

-- Hex Grip Socks White
(48, 14, 'Free Size (UK 6-11)', 'White', 'GRIP-WHT-FS', 120),

-- Hex Grip Socks Burgundy
(49, 15, 'Free Size (UK 6-11)', 'Burgundy', 'GRIP-BUR-FS', 95),

-- Match Socks
(50, 16, 'Standard (UK 7-11)', 'Black', 'SOCK-BLK-STD', 150),

-- Carbon Shin Guards
(51, 17, 'S (Under 5''4")', 'Carbon Black', 'GUARD-CARB-S', 20),
(52, 17, 'M (5''4" - 5''9")', 'Carbon Black', 'GUARD-CARB-M', 30),
(53, 17, 'L (5''9" & above)', 'Carbon Black', 'GUARD-CARB-L', 20),

-- Classic Shield Guards
(54, 18, 'M', 'Black/Blue', 'GUARD-SHD-M', 25),
(55, 18, 'L', 'Black/Blue', 'GUARD-SHD-L', 15),

-- Grip Pads
(56, 19, 'Universal', 'Clear Silicone', 'PAD-SIL-UNI', 85),

-- Goalie Gloves Gold Vortex
(57, 20, 'Size 8', 'Gold/Black', 'GLOVE-GLD-8', 8),
(58, 20, 'Size 9', 'Gold/Black', 'GLOVE-GLD-9', 10),
(59, 20, 'Size 10', 'Gold/Black', 'GLOVE-GLD-10', 7),

-- Club Gloves
(60, 21, 'Size 8', 'Black', 'GLOVE-BLK-8', 12),
(61, 21, 'Size 9', 'Black', 'GLOVE-BLK-9', 12),
(62, 21, 'Size 10', 'Black', 'GLOVE-BLK-10', 6),

-- Training ladder & cones
(63, 22, 'Standard Pack', 'Fluorescent Orange/Yellow', 'TRN-SET-01', 35),

-- Tactical Board
(64, 23, 'Standard (45x30cm)', 'Green Pitch', 'TAC-BRD-01', 20),

-- Shin Guard Tape
(65, 24, '3 Rolls Pack', 'Black', 'TAPE-BLK-3PK', 200),

-- Whistle
(66, 25, 'Standard', 'Brass Silver', 'WHSL-BRS-01', 110),

-- Captain Armband
(67, 26, 'Adjustable Elastic', 'Burgundy/Gold', 'ARMB-BUR-01', 90);

-- 5. SEED PRODUCT IMAGES (Multiple gallery views per product)
INSERT INTO `product_images` (`image_id`, `product_id`, `image_url`, `alt_text`, `is_primary`, `display_order`) VALUES
(1, 1, 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80', 'France 1998 Home Retro Kit Front View', 1, 1),
(2, 1, 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=800&q=80', 'France 1998 Chest Embroidery Close-up', 0, 2),
(3, 2, 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=800&q=80', 'Manchester United 1999 Treble Jersey Front', 1, 1),
(4, 2, 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80', 'Manchester United 1999 Collar Detail', 0, 2),
(5, 3, 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=800&q=80', 'Brazil 2002 World Cup Kit Front', 1, 1),
(6, 4, 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80', 'Argentina 1986 Maradona Jersey Front', 1, 1),
(7, 11, 'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=800&q=80', 'Vintage Predator Pro Football Boots Angle View', 1, 1),
(8, 14, 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80', 'Pro Anti-Slip Hex Grip Socks Sole Grip Details', 1, 1),
(9, 17, 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80', 'Carbon Fiber Shin Guards Texture View', 1, 1),
(10, 20, 'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?auto=format&fit=crop&w=800&q=80', 'Retro Gold Vortex Goalkeeper Gloves Latex Palm', 1, 1);

-- 6. SEED REVIEWS
INSERT INTO `reviews` (`review_id`, `user_id`, `product_id`, `rating`, `review_text`) VALUES
(1, 2, 1, 5, 'Incredible fabric quality! The 1998 France shirt feels like genuine nostalgia. Perfect fit and embroidery is clean.'),
(2, 3, 14, 5, 'These grip socks are a game-changer on artificial turf. Zero boot slip during matches. Worth every rupee!'),
(3, 2, 11, 5, 'The boots broke in within 15 minutes of play. Amazing ball touch and aggressive grip on grass.');
