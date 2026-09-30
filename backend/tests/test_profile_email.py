from services.profile import extract_email


class TestExtractEmail:
    def test_finds_and_lowercases(self):
        assert extract_email("Contact: Jane.Doe@Example.COM here") == "jane.doe@example.com"

    def test_none_when_absent(self):
        assert extract_email("no address in this text") is None

    def test_none_for_empty(self):
        assert extract_email("") is None
        assert extract_email(None) is None
