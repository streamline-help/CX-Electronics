#!/usr/bin/env python3
"""Finds products in db_products.csv not in current DB and generates SQL to restore them."""

import csv, json, sys, os

CATEGORY_MAP = {
    'accessories':  '654d3c50-6493-414e-92ab-7172664564f6',
    'automobile':   '0eb54176-5a82-40d3-a09e-36ec6efea291',
    'cables':       'a546a072-05f7-49ee-8c0e-4c88486ace91',
    'cctv':         '8d7071bd-19ac-4d9b-b063-d45da728b19c',
    'chargers':     '18f8eb90-4675-44f5-9ec3-c5fb813698d5',
    'household':    '5712e69a-99c9-496f-8f85-ea1569795db9',
    'kitchen':      '25eb82a4-56f1-47b6-80bc-c7b62b4d0d64',
    'power banks':  '3bd9fbe1-77c6-435a-887d-ec04b8da0dc0',
    'routers':      'f8f9b2d3-bb86-41c8-a463-da52f3c4b8bb',
    'smartwatches': 'ac942ec6-be4e-434b-94a4-12613891fa95',
    'solar':        '7d7e8c76-f562-4a14-9e69-d85bca101a14',
    'tools':        '195d358a-e1b7-47fd-bb9a-d3022b7fb2c3',
}

def esc(s):
    if s is None:
        return 'NULL'
    return "'" + str(s).replace("'", "''") + "'"

def load_current_ids(path='current_ids.txt'):
    """Load current DB product IDs - either from file or use hardcoded set."""
    # These are ALL current DB product IDs (from the SQL query output)
    return {
        '6ccef3da-17bd-4824-9868-2579adff0cd0','9b7175f9-ab0e-49ae-997d-b5b85074ff7e','0cb9f647-4d38-46ba-b791-7ada899fe0cd',
        '31a4de78-7888-41c0-97da-ec89d8f1e832','48db5dda-9513-4e10-a3e6-358a6e42db5b','4dc4b239-5761-4933-8a27-79c2a3b3e314',
        'eb6df9d1-6caa-4d10-be96-9d2ec733fb2c','2778eb74-ccb1-4e05-8770-df3e0b8d1715','1f8c517d-e18a-48cf-972a-7296f7e47171',
        '90e4cd2d-ed1a-4e13-a5c8-c7c5b9cf396b','0658098f-8cdb-40c0-a8a1-507b703acbbc','94d1f884-77b9-4d88-9f3c-3b945e7074a5',
        'edd96c44-b489-493c-a4d9-debaf5d38dc8','8bcf4a43-1348-43bb-b1b8-c4ae5018dda9','6cee6dc6-57c0-4f53-85c2-7cda7a0c8b18',
        'bd929fb0-80d6-48a7-a1ee-4a467770576a','a17c9085-fa8a-404f-9ffd-2c3257a3f793','b9e17202-32d1-45f2-babc-e27e27c97ad7',
        'a34c40b5-ae66-457f-b470-25f96978fa82','2e27c536-0272-4376-aa4b-b0d2bdfe199a','0b1a98f8-f75b-4fde-ba0a-3716a5f7f5f5',
        '0226f62c-bf97-4cd7-b1ec-425bf875c85c','40b08622-f4f0-42ed-83a4-22079d51c33d','c0a6e28f-98a0-4ce6-ac28-b37f24fb2faa',
        '97c193e1-5b84-47d8-b969-f493437bc96e','d7ce58f1-3743-456a-9172-dc1cfda727e3','0823cb0f-f4f9-4c0f-9d91-c23ce36456ff',
        '885169c1-1d66-42ef-94ae-9716431d23d9','ff547685-b577-4f62-a20b-66eb04f2d9d5','502ee371-099e-400a-8674-e3f551410b6d',
        'be4c9e4a-cdc5-4af6-84b6-cf27121e56e5','07482a61-0d0b-4a3e-a7c0-26b331afb354','f72859b6-25bd-45ea-a49a-38ead0cf7dd0',
        'b459dcee-15b2-4361-b44b-913b1a39cbea','3457a8a5-5805-435a-a778-0de1316f6ae4','f34ff90d-c629-4740-8955-2996df1a9e77',
        'e601bcc1-fd70-4565-8822-6c115b9941e8','897112e2-0e42-45fb-b568-66a868a9d5fb','81b0d72a-c08d-43c6-a004-71132c7e739e',
        'bb87ece1-54dd-49d4-a32d-18bc75479c3f','2a5d420d-cd8d-44d2-85a6-f6acb55168c2','d5ecd84b-3fa7-4485-98d1-43133dbda096',
        '2f962edd-156e-47bf-8ed2-0be5cdd6dc14','4339bb73-4aa0-4c98-92d2-eee291479267','f94184d1-a3f4-4666-9134-86dc3b14145b',
        '00b8787f-8ced-4c48-8a18-4aad7f61ca6b','a0ffd400-03fc-4dc2-8e7f-93775c0e0a83','1ebe30aa-cf46-4eb3-a89e-3d92557914f5',
        '8b090001-02fc-422c-bd3c-7b61f75c6dc5','ff62a276-aa8c-45f5-a4eb-9e4022981ffa','9660c823-24d2-4ce8-9800-00aed340f4a3',
        '0cb2021b-94ee-4e59-9b46-5b0f765254cc','9b5b836b-fd11-4213-b353-664a83555a17','2e6c0589-1395-4353-a89c-c6b356a84efa',
        '9089ff4a-f855-4387-af37-675860bfa93b','a3b93daa-37ee-4bed-876f-a42073691f8d','3658d0ff-bc27-43bf-acc1-d08314c455ce',
        'd22f17f5-bd88-478e-9a54-66c59290793a','4751bbb5-1221-4f2e-8a15-5aaf3c7df475','34096214-b1f3-439a-8d27-3088db83b96a',
        '72a0b1aa-3fa1-41e7-b220-22b1cc799997','b16950c5-54f3-4c1b-a793-7f699e60c992','fa7d2027-0981-4c3f-b7e7-7bf45e898964',
        '974ad3ba-5754-4d57-98ae-9cca841a46da','db1684f7-c26f-4806-b499-6e2f1fd978b0','39688250-b621-4dc1-a6eb-3685fe2b74bd',
        '3443a0b7-e09c-4d89-a261-16d37096f50c','a55c28b2-2cc8-4674-a6d1-5af7f81e12b3','14624c43-e30a-4f2c-8bae-54a0aeb80457',
        '0feac867-6e8d-4756-81e7-2aeaf29d1728','0386baa8-0151-4680-9c8e-0ccb879263e5','2057b0a6-4e06-48d6-9fb3-8a296d50c7da',
        '58876661-9207-4941-92ba-69104e79ea67','fa8684da-45a5-4252-a09f-aeb416ab3b09','be725553-7e31-4c99-b5e1-de6d3ad8267f',
        'c7988b15-6a5f-45d8-ae53-a47ec42b151e','e7ed3751-ce9f-45f8-8f25-8d63fd4fb9f7','00ab1236-daac-40fe-87bc-027d6304267e',
        '2651777d-6b4c-4005-8a2a-362ebbbaaa42','79c68c8d-81a3-4b09-8805-4d376a1326f4','ace17833-9897-4246-ac2b-e1f581911f99',
        '7a6ded2d-163a-40d3-b8d8-57f4489420d6','0ed50ea5-2df5-4ee3-9618-4b866e50a17b','55b3c7ff-ef78-4436-94b4-d8f24df91587',
        'c86c0dec-5352-4e70-a3e6-26d7702d1512','d9e3ebbb-a9bf-4c1c-80e6-c2760dc3a546','565ab7a3-8196-4ed2-95e5-f9b4d12cd4e1',
        'e89a020a-192c-4ba5-b44b-34693df5f368','5b6259e1-3d9e-4613-b3f0-1534f499ebdc','bad12710-c61e-4296-89b9-b4ddd3766a9c',
        '6d6b5b80-d71d-4f42-856f-0db53d8a938e','97d39140-0c3b-4ec5-9a8c-cd06ec77ee28','bb66a5eb-983a-4f4d-84f8-8452058df473',
        '25979d46-5a02-4498-98f9-70a4ba6f978b','1fabaf72-fbb6-41bb-bf61-49871abe8499','78d9dc11-de70-4ace-ac46-616113908952',
        'a449af44-76fe-42a4-bc1b-a91b5f76574c','51582542-90f9-4d5f-8902-b9fa0955e3c1','a2a36e36-5501-4784-8e22-9157a0ec7b40',
        '108c1001-4af2-4e12-a04f-18b3aabd9a06','efc875c9-0d9b-42ec-a640-87da391456fd','b7d5c0a1-9e6a-4951-ac3b-92f989e88478',
        '7829945e-e776-4631-b7e5-50d49e0412b5','cc643454-8631-4f92-a36d-4cc879eaab46','59223dc6-9bef-45ba-9dfe-03362b62488d',
        'd308c442-c903-4157-acd9-b078876ac9cb','d31cc482-9def-4ab3-b454-fa09a7c3bf00','8de920cd-a511-402f-b705-b212c3f53e6b',
        '6d2e92bf-d9d3-4a8d-a4c0-756ac9cc74c6','d4dae2e2-ca9b-477b-b4d5-5c852d85b6b2','ece2888a-5a20-4b64-9a19-d68ce1e1eaf2',
        'a78c0fd9-2cfd-4259-a3e6-8c94d2876954','deecb1af-7256-44c5-a022-66e8f68db7a6','58542173-c8bf-48e9-9bf8-8c729ad715e7',
        '28e2be57-0a25-4c10-9cd3-89c44e9366d1','ab779800-4d7a-4d88-9f9e-0eb4266a03f2','b04c7418-01f3-4944-a886-357f7398fa4c',
        'd927f55f-e75c-4d70-ac8f-7517e73d0254','35c8c8ba-af2b-4c8f-9b0b-ea8426ba44f6','370835cf-bd6d-4d3f-8bae-596df4f04eeb',
        '1cb6feb7-e594-452f-a898-d99d6ac60ed2','9042451f-275c-4c61-8dd7-f76d97c7e70f','507eec9a-2690-482f-85fd-460e601020eb',
        'e984f7cf-11c2-4b27-9250-0f4fa9ab70fd','fa570ed8-7ddf-4ce4-ab3d-511eb66e1b8e','c79b716a-81d1-4de7-bf3b-f61211e5f081',
        'a2d50e6a-0fb0-4ffe-b875-602090c803d9','cec75b0a-6d2b-4c96-9d16-197d5d5edd0a','306767c3-4a9b-4977-b167-90277d3e29e4',
        'c2523fe1-7cac-4ad6-8567-29f40b709cb2','4ede05f3-336a-4263-ad72-fbe88c8d2cfd','7ec19f53-b32b-42b1-9df3-7f3c50913222',
        'b40747cf-e76b-4903-8ac4-deef490219e9','c83f5480-4e39-4af7-960f-0d81482570a5','28de4eae-6c67-4304-9d33-d56ded5cc846',
        '2c8322a0-4430-4cb0-aaee-2af1f7d8f6a9','d77deea7-272c-4d4f-9220-a2247f0ab0e3','e6035e7e-eb97-4d56-859e-2ae17dbcb8ae',
        '479a6b03-990b-4890-bbae-71a9c39b9741','6d337f20-3ffe-469d-8e75-b72d56de5363','7e7fe6ec-307e-44b1-b0c5-641ad45a4dbf',
        'e5366210-bef2-42aa-b5d4-5d74c941c1ec','153de49a-aaf2-41a7-93b1-7724033a0cc9','40b3fa7b-5b79-4ae4-8015-56597f02d2cb',
        '1ff787dc-4117-4ee1-81a6-aad751f88054','d3772b6d-07f2-4c99-8a0f-70ca044494ec','f883dad7-bac6-4492-9576-7bdeed5b69ac',
        '5f8a4dc4-6395-4fd6-ad6e-2b7aa5c20366','afcd399a-d74d-4ac8-a055-b6d8cba0d7c0','3b3b5a2f-4f51-4652-b394-589cf519a350',
        '9dffd372-79c6-4906-a85f-b1b0ca19ee90','eff0b262-c47a-416c-a251-21fb8c023b3c','49f88e4f-74d8-4783-9443-8bbe1935bc1f',
        'd7af488c-5afe-4ee6-b2ab-42f19a592ad2','1f975442-7b11-4b62-9434-a86e42179d3e','e7982edb-88ce-4151-a899-0064833a0473',
        'b3049be5-f625-4a16-9b73-47e337c65899','8c7f189c-b695-4980-9b11-799b2d2cd162','af7488b6-3e4f-496b-a704-74cad55ddf4a',
        'bedc7145-dc78-4b8b-8c7d-6c430a26015a','f45892d0-efaa-43f9-a184-50f3cf165b4d','7a0ccdfe-ed21-4677-8e6b-4dee9348fa64',
        'a89b90cd-fa21-48f6-b31b-31dfb30b4edc','68aba5c7-e167-491b-9419-4306a2d5e435','0739dd0f-5bd9-456b-bf93-b545a0f605e7',
        '9451b976-fed6-48e4-9ade-f13f5505743a','5d3b4afe-fbb2-49aa-bb89-a43b880a98c6','86abd156-47ab-486b-b528-acad249ce42f',
        '7d0457f4-4307-464e-b00e-f464b1098562','1bae8b64-f7a4-40d0-a133-22ea3e45cff9','dee116dd-01bf-4092-8418-02b174a8a3ed',
        'cc0483b0-ab3d-411f-b43b-5d53c9798b4e','f0b1582c-21d2-4134-a34f-b42ccb6d9366','099668d0-d4bd-4ffb-bf87-08e65c6e83c7',
        '78aa379b-68d1-4879-abce-6f8d31c39916','aa80be5f-689a-4869-acfb-0b61d8c35996','9e7fe67e-8696-426e-91a2-d454c96494ba',
        'f7a8c5b8-3068-449a-bfd1-fac30ad34759','33f13b2c-8f21-4ea6-bde6-f258ac506c6a','22893bbb-27b5-4ef9-ba54-4a5af26dcecb',
        '8077c30b-3a69-49a5-abe1-31a4276345e1','eae87514-66a4-432f-9178-72e22226564b','4e68e482-4ec7-49b5-ac81-b76a5ced7884',
        'd5745e98-3b33-4902-a768-0a9fc2284d4e','01a650c1-d119-47ba-9f49-c94a1c6ae97d','63460656-9c2b-4e7a-9ca5-9fbd4237b518',
        '0cbefe31-9268-48ce-a612-c727817fd696','585d96a8-d9a2-41df-973a-110db4fc5086','584e8f57-1880-4ef9-a307-f04b7cff833a',
        '7aaca43c-0af7-460f-813f-3240896ca2a3','748559f6-738d-4200-a975-483c404f3848','de6feaf2-85fd-4b57-9456-f130f18da662',
        'c8b53215-4e90-465a-861d-852e7df760c5','5c10718a-a4a5-4902-a479-ad1348d94c9b','ebdb59a0-2e9f-4d7d-a9b3-d4cf1c641efe',
        '1748bc6e-0949-4c1e-b919-5f89bc979555','2ab77781-6c17-4869-a06a-b895f9eabc2e','38098d72-b70b-4b34-aa39-11c23364bd41',
        '8b07a3e9-ccae-414d-9cd2-6f055cb3bda3','893eb099-cd8d-4ecb-8f0d-647375ed6e81','f07c9ff4-5548-47ed-9ad0-cc02773db20e',
        'cad57a91-ffd5-4a24-a854-5218a700268a','f24cbba7-e61f-4f24-9499-498b1c15b2c1','cde3a643-07d2-4bf4-9e28-edca67167c57',
        '6b8fb725-84f5-4b5a-a9ec-6df467661a29','f2cead72-02c5-4bcb-9221-667c21719818','daf5f4c0-e8ec-477f-bb7d-4a1c7a049eae',
        '777314f3-240b-495e-a4f8-c9f741286720','07a472dc-818a-482a-a20c-f59f3ed28df4','a52d5937-9f47-4b8c-b668-7e4bb7eb65f1',
        '36dbfad9-3510-4fb3-999c-05b0c16bc9ee','f128cad6-9d3a-44ab-a5bc-a2de7660b947','08ebac6c-2d04-481e-8969-124449bcdea0',
        '40cd3357-621d-4bb1-b2ab-41893291fcd4','bba7463d-86c4-479f-b737-691531e160e0','caed3128-3d8b-4b9d-9033-4969f4bf4fae',
        '9e75787d-00cb-4c20-987c-21f65a4b7c02','64d7bfbe-227e-4e82-80aa-0f41d5c32cd2','4843b521-7918-422d-8c67-1aaeb469612d',
        'e779ce8f-1d7d-472a-9932-cf657d53f453','109b9f46-84d7-4a61-820a-cd8ddf48956d','c0d27d58-975e-4b86-8ed2-5cf532425569',
        'fa32a610-10ec-4fbd-b13e-3112a235cb7b','5fea8107-80fd-496d-a862-b3f2c635c3ff','1cd0d3e6-1f1f-47a4-baa6-54d1a3764522',
        '0ab930d9-cd3b-41be-b592-0dbb1ea8ce95','9a4538dc-9095-4521-be62-7dc70a1811a5','52a14b00-ffc8-4a75-839d-4ff40e59369a',
        '6b7acfa0-3c03-48d4-916b-9c8e2f4fa030','5a2f54f0-7736-42d8-80b2-bb1bce4ed24a','f2776210-79b7-48a9-a8dc-6f23b013306d',
        'eddaf0a5-fd82-4235-a4ea-798ac538258c','0f7de20f-b201-4caa-803d-2b65766b5cb2','0e6ac2ef-d388-44f3-966f-556a49bd419b',
        '974ce93a-32d3-4672-b8f7-2c4be2fc6a2c','6995929e-d546-49b0-8461-bcf5bbd48ef7','60dd3278-1bcd-4cfc-8087-e91596db90db',
        'befb4eeb-f364-41a2-9bb4-2c6aac6d312d','c3b00ee0-5818-4cca-be60-5c4917d7f622','ef588f3c-0267-498c-8fa2-e9c02b42c025',
        '5025a4ec-8b64-4e82-9f28-9110931039ed','9064385a-7ca7-4f40-9c12-5313f5b5b06a','6f3f75b1-570c-4fcb-af74-4ec2679b1f1d',
        '48a5b361-c1f2-45d8-8320-cb3b43506328','d514ad23-0bd7-494f-9ae6-a860a13cc65b','e25244cc-555c-4bbc-bb31-5f0921adc628',
        '9de06f36-0ef8-4f84-aab6-9d501ebadfac','cd2cc21c-96a0-42e9-81b1-8b773d428c6d','60b9242e-3d00-4624-a410-d1720ffad418',
        '7bfd2238-5e0a-46b9-ae5f-5536b0b925ac','e18ae2c0-775e-4554-95b4-2a0084492b6d','cf5ad90a-b408-47f2-8502-7fbb167f35df',
        '435dab60-4e05-4107-aff5-d00eab3517c2','8069b1be-b6d8-4972-bd26-a0ad5d9d9a0c','2e1e6829-9d10-4449-942b-cefbdba23de8',
        '46309ee8-35f0-40a3-96f4-03d3e388bbb9','f97cf569-bd29-4f3d-a60c-6fa7e3231d6b','d7eb8385-191f-4b27-9fc6-c48d1a56a686',
        '87cd83f0-ca74-40c2-84bd-8d45cae47f9d','1dc9c535-da9e-49f1-9e06-1dd2ea948d9f','8a6db15a-1232-4462-8869-191e103fb11e',
        'baf8167b-0223-40c3-a94c-eee4c6bf5008','967a1e91-1736-49b3-9a23-967325e6bd90','27a7bf2a-2ea0-41e1-b6eb-59ba29e6a17c',
        'd85bfbbf-5b1c-4d4d-8c4e-1e26e21b3ed3','401d7f6c-2234-458b-8c0a-fd32f74cfa80','d6d0d2e0-4308-47ec-9f96-8a22e73aac50',
        '97d716cf-042e-4d05-86ce-9fd1fd6115ab','7b8fd5ae-42f0-4356-b4c6-7fd4320020b3','626feab8-f25a-48df-969b-871f2b1a55fc',
        '878124a6-5738-4033-86ce-7a78996756ee','49e12e3c-d623-486b-8eeb-42466426dbd2','b5b84074-1901-4624-b3d2-1b1938fe0f53',
        '10b8bf2d-9f67-410c-bcf3-92b14c6e3aad',
    }

base = os.path.join(os.path.dirname(__file__), '..')

# Build description lookup from source CSVs
desc_lookup = {}
for fname in ['products-master.csv', 'amazon-cleaned.csv']:
    fpath = os.path.join(base, fname)
    if not os.path.exists(fpath):
        continue
    with open(fpath, newline='', encoding='utf-8', errors='replace') as f:
        for row in csv.DictReader(f):
            name = (row.get('name') or '').strip()
            desc = (row.get('description') or '').strip()
            if name and desc and name not in desc_lookup:
                desc_lookup[name] = desc

print(f"Description lookup: {len(desc_lookup)} entries")

current_ids = load_current_ids()
missing = []
skipped = []

db_path = os.path.join(base, 'db_products.csv')
with open(db_path, newline='', encoding='utf-8', errors='replace') as f:
    for row in csv.DictReader(f):
        pid = (row.get('id') or '').strip()
        if not pid or pid in current_ids:
            continue

        cat_name = (row.get('category') or '').strip().lower()
        cat_id = CATEGORY_MAP.get(cat_name)
        if not cat_id:
            skipped.append(f"Unknown category '{cat_name}' for: {row.get('name')}")
            continue

        retail_str = (row.get('retail_price') or '').strip()
        try:
            retail_price = float(retail_str)
        except ValueError:
            skipped.append(f"Bad price for: {row.get('name')}")
            continue

        bulk_str = (row.get('bulk_price') or '').strip()
        bulk_price = None
        if bulk_str:
            try: bulk_price = float(bulk_str)
            except ValueError: pass

        bulk_qty_str = (row.get('bulk_min_qty') or '').strip()
        bulk_min_qty = None
        if bulk_qty_str:
            try: bulk_min_qty = int(float(bulk_qty_str))
            except ValueError: pass

        name = (row.get('name') or '').strip()
        slug = (row.get('slug') or '').strip()
        variant_group_id = (row.get('variant_group_id') or '').strip() or None
        variant_label = (row.get('variant_label') or '').strip() or None
        description = desc_lookup.get(name)
        is_bulk = bulk_price is not None

        missing.append({
            'id': pid,
            'name': name,
            'slug': slug,
            'category_id': cat_id,
            'retail_price': retail_price,
            'bulk_price': bulk_price,
            'bulk_min_qty': bulk_min_qty,
            'is_bulk_available': is_bulk,
            'description': description,
            'active': True,
            'stock_status': 'in_stock',
            'featured': False,
            'variant_group_id': variant_group_id,
            'variant_label': variant_label,
        })

print(f"Missing products to restore: {len(missing)}")
print(f"  - with descriptions: {sum(1 for p in missing if p['description'])}")
print(f"  - with variant_group: {sum(1 for p in missing if p['variant_group_id'])}")
if skipped:
    print(f"  - skipped: {len(skipped)}")

# Generate SQL in batches of 100 rows per INSERT
BATCH = 100
sql_parts = []
for i in range(0, len(missing), BATCH):
    batch = missing[i:i+BATCH]
    rows_sql = []
    for p in batch:
        vg = esc(p['variant_group_id'])
        vl = esc(p['variant_label'])
        desc_val = esc(p['description'])
        bulk_p = str(p['bulk_price']) if p['bulk_price'] is not None else 'NULL'
        bulk_q = str(p['bulk_min_qty']) if p['bulk_min_qty'] is not None else 'NULL'
        rows_sql.append(
            f"('{p['id']}', {esc(p['name'])}, {esc(p['slug'])}, "
            f"'{p['category_id']}', {p['retail_price']}, {bulk_p}, {bulk_q}, "
            f"{str(p['is_bulk_available']).lower()}, {desc_val}, "
            f"true, 'in_stock', false, ARRAY[]::text[], "
            f"{vg}, {vl})"
        )
    sql_parts.append(
        "INSERT INTO public.products "
        "(id, name, slug, category_id, retail_price, bulk_price, bulk_min_qty, "
        "is_bulk_available, description, active, stock_status, featured, images, "
        "variant_group_id, variant_label)\nVALUES\n" +
        ",\n".join(rows_sql) +
        "\nON CONFLICT (id) DO NOTHING;"
    )

out_path = os.path.join(base, 'scripts', 'restore-products.sql')
with open(out_path, 'w', encoding='utf-8') as f:
    f.write('\n\n'.join(sql_parts))

print(f"\nSQL written to: {out_path}")
print(f"SQL file size: {os.path.getsize(out_path):,} bytes")
print(f"Batches: {len(sql_parts)}")
